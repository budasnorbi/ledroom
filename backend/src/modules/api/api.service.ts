import { Injectable, InternalServerErrorException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { dirname } from "path"
import * as asyncFs from "fs/promises"

import { Songs } from "@entities/Songs"
import { SongsRepository } from "@repositories/Songs.repository"
import { LedService } from "../Led/led.service"
import { UpdateBeatsSchema } from "@dto/updateBeats.yup"
import { LastTimePositionSchema } from "@dto/lastTimePosition.yup"
const appDir = dirname(require.main.filename)

@Injectable()
export class ApiService {
  constructor(private ledService: LedService) {}
  @InjectRepository(SongsRepository) private songRepository: SongsRepository

  async uploadSong(file: Express.Multer.File) {
    const songBuffer = file.buffer
    const fileSize = file.size
    const avgBytePerSec = songBuffer.readInt32LE(28)
    const duration = fileSize / avgBytePerSec

    const filePath = `${appDir}/../songs/${file.originalname}`
    await asyncFs.writeFile(filePath, songBuffer).catch((error) => {
      console.log(error)
      throw new InternalServerErrorException()
    })

    const newSong = new Songs()
    newSong.name = file.originalname
    newSong.path = filePath
    newSong.duration = duration

    const insertedSong = await this.songRepository.save(newSong).catch((error) => {
      console.log(error)
      throw new InternalServerErrorException()
    })

    const { path, ...restSongData } = insertedSong

    return restSongData
  }

  getSongs() {
    return this.songRepository.getSongs()
  }

  async getSongPath(id: number) {
    return this.songRepository.findOne({ id }).catch((error) => {
      console.log(error)
      throw new InternalServerErrorException()
    })
  }

  async removeSong(id: number) {
    const song = await this.getSongPath(id)

    await this.songRepository.delete({ id }).catch((error) => {
      console.log(error)
      throw new InternalServerErrorException()
    })

    await asyncFs.unlink(song.path).catch((error) => {
      console.log(error)
      throw new InternalServerErrorException()
    })

    return { status: "OK" }
  }

  async updateBeats(body: UpdateBeatsSchema) {
    const { id, ...beatOptions } = body
    await this.songRepository.update({ id }, beatOptions).catch((error) => {
      console.log(error)
      throw new InternalServerErrorException()
    })
  }

  async updateLastTimePosition(body: LastTimePositionSchema) {
    const { time, id } = body
    await this.songRepository.update({ id }, { lastTimePosition: time }).catch((error) => {
      console.log(error)
      throw new InternalServerErrorException()
    })
  }
}
