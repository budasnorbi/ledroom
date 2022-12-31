import { PartialStepEffectSchema, StepEffectSchema } from "@ledroom2/validations"
import { Injectable, InternalServerErrorException } from "@nestjs/common"
import { PrismaService } from "../../prisma.service"
import { LedService } from "../Led/led.service"

import type { step_effects } from "@prisma/client"

@Injectable()
export class EffectService {
  constructor(private prismaService: PrismaService, private ledService: LedService) {}

  async addStepEffect(body: StepEffectSchema) {
    const savedStepEffect = await this.prismaService.step_effects.create({
      data: body,
      include: {
        regions: true
      }
    })

    return { id: savedStepEffect.id }
  }

  async patchStepEffect(id: step_effects["id"], body: PartialStepEffectSchema) {
    await this.prismaService.step_effects.update({
      where: { id },
      data: body
    })

    await this.ledService.syncSongDetails()
  }

  async deleteStepEffect(id: step_effects["id"]) {
    await this.prismaService.step_effects.delete({ where: { id } })
  }
}
