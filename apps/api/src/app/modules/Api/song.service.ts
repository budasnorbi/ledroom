import { BadRequestException, Injectable } from "@nestjs/common";
import * as asyncFs from "fs/promises";
import * as audioApi from "web-audio-api";
import * as path from "path";

import { RegionsRepository } from "../../repositories/Regions.repository";
import { SongsRepository } from "../../repositories/Songs.repository";

import { DBSong } from "@ledroom2/types";
import analyzeMusic from "../../utils/analyze-music";
import { OptionalSongSchema } from "@ledroom2/validations";

@Injectable()
export class SongService {
  constructor(
    private songRepository: SongsRepository,
    private regionsRepository: RegionsRepository
  ) {}

  async uploadSong(file: Express.Multer.File): Promise<DBSong> {
    if (!file) {
      throw new BadRequestException("File not found");
    }

    const songBuffer = file.buffer;
    const filePath = `${path.resolve("./")}/songs/${file.originalname}`;
    await asyncFs.writeFile(filePath, songBuffer).catch(() => {
      throw new BadRequestException("Sikertelen mentés!");
    });

    const context = new audioApi.AudioContext();

    const analyzedMusic = await analyzeMusic(context, songBuffer);

    const newSong = this.songRepository.create({
      name: file.originalname,
      path: filePath,
      bpm: Math.round(analyzedMusic.bpm),
      beatOffset: analyzedMusic.beatOffset,
      beatAroundEnd: analyzedMusic.beatAroundEnd,
      selected: true,
    });

    const savedSong = await this.songRepository.save(newSong);

    return {
      id: savedSong.id,
      name: savedSong.name,
      bpm: savedSong.bpm,
      beatOffset: savedSong.beatOffset,
      beatAroundEnd: savedSong.beatAroundEnd,
      lastTimePosition: savedSong.lastTimePosition,
      selectedRegionId: savedSong.selectedRegionId,
      volume: savedSong.volume,
    };
  }

  async getSongs() {
    const songs = await this.songRepository.getSongs();
    const selectedRegionId = await this.songRepository.getSelectedSongId();

    return { songs, selectedRegionId };
  }

  async getSong(id: number) {
    const song = await this.songRepository.findOne({
      where: { id },
    });

    if (!song) {
      throw new BadRequestException("There is no song with this id");
    }

    return song;
  }

  async removeSong(id: number) {
    const song = await this.getSong(id);
    await this.songRepository.delete({ id });
    await asyncFs.unlink(song.path);
  }

  async patchSong(songId: number, body: OptionalSongSchema) {
    if ("selected" in body) {
      await this.songRepository.update({ selected: true }, { selected: false });
    }
    await this.songRepository.update({ id: songId }, body);
  }
}
