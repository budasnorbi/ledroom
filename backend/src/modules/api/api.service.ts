import { Injectable, InternalServerErrorException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { dirname } from "path"
import * as asyncFs from "fs/promises"

import { Songs } from "@entities/Songs"
import { SongsRepository } from "@repositories/Songs.repository"
import { LedService } from "../Led/led.service"
import { UpdateBeatsSchema } from "@dto/updateBeats"
const appDir = dirname(require.main.filename)

@Injectable()
export class ApiService {
  constructor(private ledService: LedService) {}
  @InjectRepository(SongsRepository) private songRepository: SongsRepository

  async uploadSong(file: Express.Multer.File) {
    const filePath = `${appDir}/../songs/${file.originalname}`
    await asyncFs.writeFile(filePath, file.buffer).catch((error) => {
      console.log(error)
      throw new InternalServerErrorException()
    })

    const newSong = new Songs()
    newSong.name = file.originalname
    newSong.path = filePath

    const insertedSong = await this.songRepository.save(newSong, {}).catch((error) => {
      console.log(error)
      throw new InternalServerErrorException()
    })

    return { id: insertedSong.id }
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
}
