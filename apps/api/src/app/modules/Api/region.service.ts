import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../prisma.service"
import type { AddRegionSchema, PatchRegionSchema } from "@ledroom2/validations"
import type { regions } from "@prisma/client"

@Injectable()
export class RegionService {
  constructor(private readonly prismaService: PrismaService) {}

  async addRegion(body: AddRegionSchema) {
    const { endTime, songId, startTime } = body

    const savedRegion = await this.prismaService.regions.create({
      data: {
        songId,
        endTime,
        startTime
      },
      select: {
        id: true
      }
    })

    return { id: savedRegion.id }
  }

  async patchRegion(regionId: regions["id"], body: Partial<PatchRegionSchema>) {
    await this.prismaService.regions.update({
      where: {
        id: regionId
      },
      data: body
    })
  }

  async deleteRegion(regionId: regions["id"]) {
    await this.prismaService.regions.delete({
      where: {
        id: regionId
      }
    })
  }
}
