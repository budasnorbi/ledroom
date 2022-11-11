import { PartialStepEffectSchema, StepEffectSchema } from "@ledroom2/validations"
import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common"
import { StepEffectRepository } from "../../repositories/StepEffect.repository"
import { nanoid } from "nanoid"
import { RegionsRepository } from "../../repositories/Regions.repository"
import { LedService } from "../Led/led.service"

@Injectable()
export class EffectService {
  constructor(
    private stepEffectRepository: StepEffectRepository,
    private regionsRepository: RegionsRepository,
    private ledService: LedService
  ) {}

  async addStepEffect(body: StepEffectSchema) {
    const id = nanoid()

    const newStepEffect = this.stepEffectRepository.create({ ...body, id })
    await this.stepEffectRepository.save(newStepEffect).catch((error: any) => {
      console.log(error.driverError.errno)
    })

    await this.regionsRepository
      .update({ id: body.regionId }, { stepEffect: newStepEffect })
      .catch((err) => {
        console.log(err)
      })

    return { id }
  }

  async patchStepEffect(id: string, body: PartialStepEffectSchema) {
    await this.stepEffectRepository.update({ id }, body).catch((err) => {
      console.log(err)
      throw new InternalServerErrorException()
    })

    await this.ledService.syncSongDetails()
  }

  async deleteStepEffect(stepId: string) {
    await this.stepEffectRepository.delete({ id: stepId })
  }
}
