import { Injectable, InternalServerErrorException } from "@nestjs/common"
import { dirname } from "path"
import * as asyncFs from "fs/promises"
import * as audioApi from "web-audio-api"
import * as MusicTempo from "music-tempo"

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

const analyzeMusic = (context: any, songBuffer: Buffer): Promise<number> => {
  return new Promise((res, rej) => {
    context.decodeAudioData(songBuffer, (decodedBuffer) => {
      try {
        let audioData: any = []
        // Take the average of the two channels
        if (decodedBuffer.numberOfChannels == 2) {
          const channel1Data = decodedBuffer.getChannelData(0)
          const channel2Data = decodedBuffer.getChannelData(1)
          const length = channel1Data.length
          for (let i = 0; i < length; i++) {
            audioData[i] = (channel1Data[i] + channel2Data[i]) / 2
          }
        } else {
          audioData = decodedBuffer.getChannelData(0)
        }
        const musicTempo = new MusicTempo(audioData)
        res(musicTempo)
        //res(musicTempo)
      } catch (error) {
        rej(error)
      }
    })
  })
}

@Injectable()
export class ApiService {
  constructor(
    private ledService: LedService,
    private songRepository: SongsRepository,
    private regionsRepository: RegionsRepository
  ) {}

  async uploadSong(file: Express.Multer.File) {
    const songBuffer = file.buffer

    const context = new audioApi.AudioContext()
    const analyzedMusic: any = await analyzeMusic(context, songBuffer)

    const filePath = `${appDir}/../songs/${file.originalname}`
    await asyncFs.writeFile(filePath, songBuffer)

    const newSong = new Songs()
    newSong.name = file.originalname
    newSong.path = filePath
    newSong.bpm = Math.round(analyzedMusic.tempo)
    newSong.beatOffset = analyzedMusic.beats[0]
    newSong.beatAroundEnd = analyzedMusic.beats[analyzedMusic.beats.length - 1]

    const insertedSong = await this.songRepository.save(newSong).catch(() => {
      asyncFs.unlink(filePath)
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
    return this.songRepository.findOne({ where: { id } })
  }

  async removeSong(id: number) {
    const song = await this.getSongPath(id)

    await this.regionsRepository.delete({ songId: id })

    await this.songRepository.delete({ id })

    await asyncFs.unlink(song.path)

    return { status: "OK" }
  }

  async updateBeats(body: UpdateBeatsSchema) {
    const { id, ...beatOptions } = body
    await this.songRepository.update({ id }, beatOptions)
  }

  async updateLastTimePosition(body: LastTimePositionSchema) {
    const { time, id } = body
    await this.songRepository.update({ id }, { lastTimePosition: time })
  }

  async updateVolume(body: VolumeSchema) {
    const { id, volume } = body
    await this.songRepository.update({ id }, { volume })
  }

  async addRegion(body: AddRegionSchema) {
    const { endTime, songId, startTime, id } = body
    const newRegion = new Regions()

    newRegion.id = id
    newRegion.startTime = startTime
    newRegion.endTime = endTime
    newRegion.songId = songId

    await this.regionsRepository.save(newRegion)
  }

  updateRegion(body: UpdateRegionSchema) {
    const { endTime, id, songId, startTime } = body

    this.regionsRepository.update({ id, songId }, { endTime, startTime })
  }

  selectRegion(body: SelectRegionSchema) {
    const { regionId, songId } = body

    this.songRepository.update({ id: songId }, { selectedRegionId: regionId })
  }

  deleteRegions(songId: number) {
    this.regionsRepository.delete({ songId })
  }
}
