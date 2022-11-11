import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Patch,
  Post,
  UnprocessableEntityException
} from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"

import {
  PartialStepEffectSchema,
  partialStepEffectSchema,
  StepEffectSchema,
  stepEffectSchema
} from "@ledroom2/validations"
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
    return this.effectService.addStepEffect(body)
  }

  @Patch("/step/:stepId")
  @HttpCode(204)
  patchStepEffect(
    @Param("stepId") stepId: string,
    @Body(new YupValidationPipe(partialStepEffectSchema))
    body: PartialStepEffectSchema
  ) {
    return this.effectService.patchStepEffect(stepId, body)
  }

  @Delete("/step/:stepId")
  @HttpCode(204)
  deleteStepEffect(@Param("stepId") stepId: string) {
    return this.effectService.deleteStepEffect(stepId)
  }
}
