import { Injectable } from "@nestjs/common"
import { dirname } from "path"
import * as asyncFs from "fs/promises"
import * as audioApi from "web-audio-api"
import * as MusicTempo from "music-tempo"

import { SongsRepository } from "@repositories/Songs.repository"
import { LedService } from "../Led/led.service"
import { UpdateBeatsSchema } from "@dto/updateBeats.yup"
import { LastTimePositionSchema } from "@dto/lastTimePosition.yup"
import { VolumeSchema } from "@dto/volume.yup"
import { AddRegionSchema } from "@dto/addRegion.yup"
import { RegionsRepository } from "@repositories/Regions.repository"
import { Region } from "@entities/Region.entity"
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
    const filePath = `${appDir}/../songs/${file.originalname}`

    const context = new audioApi.AudioContext()
    const analyzedMusic: any = await analyzeMusic(context, songBuffer)

    const newSong = this.songRepository.create({
      name: file.originalname,
      path: filePath,
      bpm: Math.round(analyzedMusic.tempo),
      beatOffset: analyzedMusic.beats[0],
      beatAroundEnd: analyzedMusic.beats[analyzedMusic.beats.length - 1],
      selected: true
    })
    const { id } = await this.songRepository.save(newSong)

    await asyncFs.writeFile(filePath, songBuffer)

    return {
      id,
      name: newSong.name,
      bpm: newSong.bpm,
      beatOffset: newSong.beatOffset,
      beatAroundEnd: newSong.beatAroundEnd
    }
  }

  async getSongs() {
    //const allSong = await this.songRepository.getSongs()
    const songs = await this.songRepository.getSongs()
    //const regions = await this.regionsRepository.getRegions()
    //const selectedSongId: number | null = songs.find((song) => song.selected).id ?? null
    console.log(JSON.stringify(songs, null, 2))
    // return { songs, regions, effects: [], selectedSongId }
  }

  async getSongPath(id: number) {
    return this.songRepository.findOne({ where: { id } })
  }

  async removeSong(id: number) {
    const song = await this.getSongPath(id)

    await this.songRepository.delete({ id })
    await asyncFs.unlink(song.path)

    const restSongCount = await this.songRepository.count()

    let selectedSongId: null | number
    if (restSongCount === 0) {
      selectedSongId = null
    } else {
      const songByAscOrder = await this.songRepository.find({ order: { id: "ASC" } })
      const lastSongId = songByAscOrder[0].id

      await this.songRepository.update({ id: songByAscOrder[0].id }, { selected: true })
      selectedSongId = lastSongId
    }

    return { selectedSongId }
  }

  async updateBeats(body: UpdateBeatsSchema) {
    const { id, ...beatOptions } = body
    await this.songRepository.update({ id }, beatOptions)
    return {}
  }

  async updateLastTimePosition(body: LastTimePositionSchema) {
    const { time, id } = body
    await this.songRepository.update({ id }, { lastTimePosition: time })
    return {}
  }

  async updateVolume(body: VolumeSchema) {
    const { id, volume } = body
    await this.songRepository.update({ id }, { volume })
    return {}
  }

  async addRegion(body: AddRegionSchema) {
    // const { endTime, songId, startTime, id } = body
    // const newRegion = new Regions()

    // newRegion.id = id
    // newRegion.startTime = startTime
    // newRegion.endTime = endTime
    // newRegion.songId = songId

    // await this.regionsRepository.save(newRegion)
    return {}
  }

  async updateRegion(body: UpdateRegionSchema) {
    const { endTime, id, songId, startTime } = body
    //await this.regionsRepository.update({ id, songId }, { endTime, startTime })
    return {}
  }

  async selectRegion(body: SelectRegionSchema) {
    const { regionId, songId } = body
    await this.songRepository.update({ id: songId }, { selectedRegionId: regionId })
    return {}
  }

  async deleteRegions(songId: number) {
    //await this.regionsRepository.delete({ songId })
    return {}
  }

  async updateSongSelected(songId: number) {
    await this.songRepository.update({ selected: true }, { selected: false })
    await this.songRepository.update({ id: songId }, { selected: true })
    return {}
  }
}
