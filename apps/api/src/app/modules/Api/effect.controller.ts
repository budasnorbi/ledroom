import { Body, Controller, Post, UnprocessableEntityException } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"

import { StepEffectSchema, stepEffectSchema } from "@ledroom2/validations"
import { EffectService } from "./effect.service"
import { AddStepEffect } from "@ledroom2/types"
import { YupValidationPipe } from "../../pipes/yupValidation.pipe"

@ApiTags("effect")
@Controller("effect")
export class EffectController {
  constructor(private readonly effectService: EffectService) {}

  @Post("step")
  addStepEffect(
    @Body(new YupValidationPipe(stepEffectSchema)) body: StepEffectSchema
  ): Promise<AddStepEffect> {
    if (body.range[0] >= body.range[1]) {
      throw new UnprocessableEntityException({
        error: "Unprocessable Entity",
        statusCode: 422,
        validations: {
          range: ["Start range can't be higher than end range!"]
        }
      })
    }
    if (body.range[1] <= body.range[0]) {
      throw new UnprocessableEntityException({
        error: "Unprocessable Entity",
        statusCode: 422,
        validations: {
          range: ["End range can't be higher than start range!"]
        }
      })
    }

    return this.effectService.addStepEffect(body)
  }
}
