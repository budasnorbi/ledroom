import { Injectable } from "@nestjs/common"

import { AddRegionSchema } from "@dto/addRegion.yup"
import { SelectRegionSchema } from "@dto/selectRegion"
import { UpdateRegionSchema } from "@dto/updateRegion.yup"
import { RegionsRepository } from "@repositories/Regions.repository"
import { SongsRepository } from "@repositories/Songs.repository"

@Injectable()
export class RegionService {
  constructor(
    private songRepository: SongsRepository,
    private regionsRepository: RegionsRepository
  ) {}

  async addRegion(body: AddRegionSchema) {
    const { endTime, songId, startTime, id } = body

    const newRegion = this.regionsRepository.create({
      id,
      songId,
      endTime,
      startTime,
      name: ""
    })

    await this.regionsRepository.save(newRegion)
    await this.songRepository.update({ id: songId }, { selectedRegionId: id })
  }

  async updateRegion(body: UpdateRegionSchema) {
    const { endTime, id, songId, startTime } = body
    await this.regionsRepository.update({ id, songId }, { endTime, startTime })
  }

  async selectRegion(body: SelectRegionSchema) {
    const { regionId, songId } = body
    await this.songRepository.update({ id: songId }, { selectedRegionId: regionId })
  }

  async deleteRegion(regionId: string) {
    const region = await this.regionsRepository.findOne({
      where: { id: regionId },
      select: ["songId"]
    })

    await this.songRepository.update({ id: region.songId }, { selectedRegionId: null })
    await this.regionsRepository.delete({ id: regionId })
  }
}
