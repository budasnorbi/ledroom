import { StepEffectSchema } from "@ledroom2/validations"
import { Injectable } from "@nestjs/common"
import { StepEffectRepository } from "../../repositories/StepEffect.repository"
import { nanoid } from "nanoid"

@Injectable()
export class EffectService {
  constructor(private stepEffectRepository: StepEffectRepository) {}

  async addStepEffect(body: StepEffectSchema) {
    const id = nanoid()
    const newStepEffect = this.stepEffectRepository.create({ ...body, id })
    await this.stepEffectRepository.save(newStepEffect).catch((error: any) => {
      console.log(error.driverError.errno)
    })

    return { id }
  }
}
