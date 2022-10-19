import { dirname } from "path"
import { BadRequestException, Injectable } from "@nestjs/common"
import { RegionsRepository } from "@repositories/Regions.repository"
import { SongsRepository } from "@repositories/Songs.repository"
import { DBSong } from "@type/db-entities"

import * as asyncFs from "fs/promises"
import * as audioApi from "web-audio-api"

import analyzeMusic from "@helpers/analyze-music"
import { VolumeSchema, LastTimePositionSchema, UpdateBeatsSchema } from "@dto/song.yup"

const appDir = dirname(require.main.filename)

@Injectable()
export class SongService {
  constructor(
    private songRepository: SongsRepository,
    private regionsRepository: RegionsRepository
  ) {}

  async uploadSong(file: Express.Multer.File): Promise<DBSong> {
    if (!file) {
      throw new BadRequestException("File not found")
    }
    const songBuffer = file.buffer
    const filePath = `${appDir}/../songs/${file.originalname}`

    const context = new audioApi.AudioContext()

    const analyzedMusic = await analyzeMusic(context, songBuffer)

    const newSong = this.songRepository.create({
      name: file.originalname,
      path: filePath,
      bpm: Math.round(analyzedMusic.bpm),
      beatOffset: analyzedMusic.beatOffset,
      beatAroundEnd: analyzedMusic.beatAroundEnd,
      selected: true
    })

    const savedSong = await this.songRepository.save(newSong)

    await asyncFs.writeFile(filePath, songBuffer)

    return {
      id: savedSong.id,
      name: savedSong.name,
      bpm: savedSong.bpm,
      beatOffset: savedSong.beatOffset,
      beatAroundEnd: savedSong.beatAroundEnd,
      lastTimePosition: savedSong.lastTimePosition,
      selectedRegionId: savedSong.selectedRegionId,
      volume: savedSong.volume
    }
  }

  async getSongs() {
    const songs = await this.songRepository.getSongs()
    const selectedRegionId = await this.songRepository.getSelectedSongId()

    return { songs, selectedRegionId }
  }

  async getSongPath(id: number) {
    return this.songRepository.findOne({ where: { id } })
  }

  async removeSong(id: number) {
    const song = await this.getSongPath(id)
    await this.songRepository.delete({ id })
    await asyncFs.unlink(song.path)
  }

  async updateSongBeatConfig(songId: number, body: UpdateBeatsSchema) {
    await this.songRepository.update({ id: songId }, body)

    // Clearing added regions
    await this.regionsRepository.delete({ songId })
  }

  async updateLastTimePosition(songId: number, body: LastTimePositionSchema) {
    const { time } = body
    await this.songRepository.update({ id: songId }, { lastTimePosition: time })
  }

  async updateVolume(songId: number, body: VolumeSchema) {
    const { volume } = body
    await this.songRepository.update({ id: songId }, { volume })
  }

  async updateSelectedSong(songId: number) {
    if (isNaN(songId)) {
      throw new BadRequestException("Hibás songId")
    }
    await this.songRepository.update({ selected: true }, { selected: false })
    await this.songRepository.update({ id: songId }, { selected: true })
  }
}
