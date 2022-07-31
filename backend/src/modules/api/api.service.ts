import { Songs } from "@entities/Songs"
import { Injectable, InternalServerErrorException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { SongsRepository } from "@repositories/Songs.repository"
import { LedService } from "../Led/led.service"
import * as asyncFs from "fs/promises"

import { dirname } from "path"
const appDir = dirname(require.main.filename)

@Injectable()
export class ApiService {
  constructor(private ledService: LedService) {}
  @InjectRepository(SongsRepository) private songRepository: SongsRepository

  async uploadSong(file: Express.Multer.File) {
    console.log(file)
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

  getAllSongName() {
    return this.songRepository.getAllSongName()
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
}
