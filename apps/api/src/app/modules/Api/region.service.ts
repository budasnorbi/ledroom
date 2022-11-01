import { BadRequestException, Injectable } from "@nestjs/common"
import { nanoid } from "nanoid"

import { RegionsRepository } from "../../repositories/Regions.repository"
import { SongsRepository } from "../../repositories/Songs.repository"

import type {
  AddRegionSchema,
  SelectRegionSchema,
  UpdateRegionNameSchema,
  UpdateRegionSchema
} from "@ledroom2/validations"
import { Region } from "@ledroom2/models"

@Injectable()
export class RegionService {
  constructor(
    private songRepository: SongsRepository,
    private regionsRepository: RegionsRepository
  ) {}

  async addRegion(body: AddRegionSchema) {
    const id = nanoid()
    const { endTime, songId, startTime } = body

    const newRegion = this.regionsRepository.create({
      id,
      songId,
      endTime,
      startTime,
      name: ""
    })

    await this.regionsRepository.save(newRegion)
    await this.songRepository.update({ id: songId }, { selectedRegionId: id })

    return { id }
  }

  async updateRegion(regionId: string, body: UpdateRegionSchema) {
    const { endTime, songId, startTime } = body
    await this.regionsRepository.update({ id: regionId, songId }, { endTime, startTime })
  }

  async selectRegion(regionId: string, body: SelectRegionSchema) {
    const { songId } = body
    await this.songRepository.update({ id: songId }, { selectedRegionId: regionId })
  }

  async deleteRegion(regionId: string) {
    const region: Pick<Region, "songId"> = await this.regionsRepository.findOne({
      where: { id: regionId },
      select: ["songId"]
    })

    await this.songRepository.update({ id: region.songId }, { selectedRegionId: null })
    await this.regionsRepository
      .delete({ id: regionId, songId: region.songId })
      .then((res) => console.log(res))
  }

  async updateRegionName(regionId: string, body: UpdateRegionNameSchema) {
    const { name, songId } = body
    const result = await this.regionsRepository.update({ songId, id: regionId }, { name })

    if (result.affected === 0) {
      throw new BadRequestException("Nincs ilyen régió vagy zene")
    }
  }

  // EFFECTS
}
