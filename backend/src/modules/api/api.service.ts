import { Injectable, InternalServerErrorException } from "@nestjs/common"
import { dirname } from "path"
import * as asyncFs from "fs/promises"

import { Songs } from "@entities/Songs"
import { SongsRepository } from "@repositories/Songs.repository"
import { LedService } from "../Led/led.service"
import { UpdateBeatsSchema } from "@dto/updateBeats.yup"
import { LastTimePositionSchema } from "@dto/lastTimePosition.yup"
import { VolumeSchema } from "@dto/volume.yup"
import { AddRegionSchema } from "@dto/addRegion.yup"
import { RegionsRepository } from "@repositories/Regions.repository"
import { Regions } from "@entities/Regions"
import { Song } from "@type/song"
import { UpdateRegionSchema } from "@dto/updateRegion.yup"
import { SelectRegionSchema } from "@dto/selectRegion"
const appDir = dirname(require.main.filename)

@Injectable()
export class ApiService {
  constructor(
    private ledService: LedService,
    private songRepository: SongsRepository,
    private regionsRepository: RegionsRepository
  ) {}

  async uploadSong(file: Express.Multer.File) {
    const songBuffer = file.buffer

    const filePath = `${appDir}/../songs/${file.originalname}`
    await asyncFs.writeFile(filePath, songBuffer).catch((error) => {
      console.log(error)
      throw new InternalServerErrorException()
    })

    const newSong = new Songs()
    newSong.name = file.originalname
    newSong.path = filePath

    const insertedSong = await this.songRepository.save(newSong).catch((error) => {
      console.log(error)
      throw new InternalServerErrorException()
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { path, ...restSongData } = insertedSong

    return restSongData
  }

  async getSongs() {
    const data: Song[] = []
    const songs = await this.songRepository.getSongs()

    for (const song of songs) {
      const regions = await this.regionsRepository.getRegionsBySongId(song.id)
      data.push({ ...song, regions })
    }

    return data
  }

  async getSongPath(id: number) {
    return this.songRepository.findOne({ where: { id } }).catch((error) => {
      console.log(error)
      throw new InternalServerErrorException()
    })
  }

  async removeSong(id: number) {
    const song = await this.getSongPath(id)

    await this.regionsRepository.delete({ songId: id }).catch((error) => {
      console.log(error)
      throw new InternalServerErrorException()
    })

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

  async updateVolume(body: VolumeSchema) {
    const { id, volume } = body
    await this.songRepository.update({ id }, { volume }).catch((error) => {
      console.log(error)
      throw new InternalServerErrorException()
    })
  }

  async addRegion(body: AddRegionSchema) {
    const { endTime, songId, startTime, id } = body
    const newRegion = new Regions()

    newRegion.id = id
    newRegion.startTime = startTime
    newRegion.endTime = endTime
    newRegion.songId = songId

    await this.regionsRepository.save(newRegion).catch((error) => {
      console.log(error)
      throw new InternalServerErrorException()
    })
  }

  updateRegion(body: UpdateRegionSchema) {
    const { endTime, id, songId, startTime } = body

    this.regionsRepository.update({ id, songId }, { endTime, startTime }).catch((error) => {
      console.log(error)
      throw new InternalServerErrorException()
    })
  }

  selectRegion(body: SelectRegionSchema) {
    const { regionId, songId } = body

    this.songRepository.update({ id: songId }, { selectedRegionId: regionId }).catch((error) => {
      console.log(error)
      throw new InternalServerErrorException()
    })
  }
}
