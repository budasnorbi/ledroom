import {
  addRegionSchema,
  AddRegionSchema,
  selectRegionSchema,
  SelectRegionSchema,
  updateRegionSchema,
  UpdateRegionSchema,
  UpdateRegionNameSchema,
  updateRegionNameSchema
} from "@ledroom2/validations"

import { Controller, Post, HttpCode, Body, Patch, Delete, Param } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"
import { AddRegionResponse, UpdateRegiongResponse, SelectRegiongResponse } from "@ledroom2/types"
import { YupValidationPipe } from "../../pipes/yupValidation.pipe"
import { RegionService } from "./region.service"

@ApiTags("region")
@Controller("region")
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Post()
  addRegion(
    @Body(new YupValidationPipe(addRegionSchema)) body: AddRegionSchema
  ): Promise<AddRegionResponse> {
    return this.regionService.addRegion(body)
  }

  @Patch(":regionId")
  @HttpCode(204)
  updateRegion(
    @Param("regionId") regionId: string,
    @Body(new YupValidationPipe(updateRegionSchema)) body: UpdateRegionSchema
  ): Promise<UpdateRegiongResponse> {
    return this.regionService.updateRegion(regionId, body)
  }

  @Patch("/:regionId/select")
  @HttpCode(204)
  selectRegion(
    @Param("regionId") regionId: string,
    @Body(new YupValidationPipe(selectRegionSchema)) body: SelectRegionSchema
  ): Promise<SelectRegiongResponse> {
    return this.regionService.selectRegion(regionId, body)
  }

  @Delete(":regionId")
  @HttpCode(204)
  delete(@Param("regionId") regionId: string) {
    return this.regionService.deleteRegion(regionId)
  }

  @Patch("/:regionId/name")
  @HttpCode(204)
  updateName(
    @Param("id") regionId: string,
    @Body(new YupValidationPipe(updateRegionNameSchema)) body: UpdateRegionNameSchema
  ) {
    return this.regionService.updateRegionName(regionId, body)
  }
}
