import { BadRequestException, Injectable } from "@nestjs/common"
import * as asyncFs from "fs/promises"
import * as audioApi from "web-audio-api"
import * as path from "path"

import { PrismaService } from "../../prisma.service"
import { DBSong } from "@ledroom2/types"
import { OptionalSongSchema } from "@ledroom2/validations"
import analyzeMusic from "../../utils/analyze-music"

import type { songs } from "@prisma/client"

@Injectable()
export class SongService {
  constructor(private prismaService: PrismaService) {}

  async uploadSong(file: Express.Multer.File): Promise<any /* DBSong */> {
    /*    if (!file) {
      throw new BadRequestException("File not found")
    }

    const songBuffer = file.buffer
    const filePath = `${path.resolve("./")}/songs/${file.originalname}`
    await asyncFs.writeFile(filePath, songBuffer).catch(() => {
      throw new BadRequestException("Sikertelen mentés!")
    })

    const context = new audioApi.AudioContext()
    const analyzedMusic = await analyzeMusic(context, songBuffer)

    const savedSong = await this.prismaService.songs.create({
      data: {
        name: file.originalname,
        path: filePath,
        bpm: Math.round(analyzedMusic.bpm),
        beatOffset: analyzedMusic.beatOffset,
        beatAroundEnd: analyzedMusic.beatAroundEnd,
        selected: true
      }
    })

    return {
      id: savedSong.id,
      name: savedSong.name,
      bpm: savedSong.bpm,
      beatOffset: savedSong.beatOffset,
      beatAroundEnd: savedSong.beatAroundEnd,
      lastTimePosition: savedSong.lastTimePosition,
      selectedRegionId: savedSong.selectedRegionId,
      volume: savedSong.volume
    } */
  }

  async getSongs() {
    const songs = await this.prismaService.songs.findMany({
      /*       select: {
        id: true,
        bpm: true,
        beatOffset: true,
        name: true,
        lastTimePosition: true,
        volume: true,
        selected: true,
        regions: {
          include: { step_effects: true }
        }
      } */
      include: {
        regions: { include: { step_effects: { include: { effect_ranges: true } } } }
      }
    })

    return songs
  }

  async getSong(id: string) {
    const song = await this.prismaService.songs.findFirst({
      where: { id: "12e121e212" }
    })

    if (!song) {
      throw new BadRequestException("There is no song with this id")
    }

    return song
  }

  async removeSong(id: songs["id"]) {
    const song = await this.getSong(id)
    await this.prismaService.songs.delete({ where: { id } })
    await asyncFs.unlink(song.path)
  }

  async patchSong(songId: string, body: OptionalSongSchema) {
    if ("selected" in body && body.selected === true) {
      await this.prismaService.songs.updateMany({
        data: { selected: false }
      })
    }

    await this.prismaService.songs.update({
      where: {
        id: songId
      },
      data: body
    })
  }
}
