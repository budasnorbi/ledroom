import {
  addRegionSchema,
  AddRegionSchema,
  selectRegionSchema,
  SelectRegionSchema,
  updateRegionSchema,
  UpdateRegionSchema,
  UpdateRegionNameSchema,
  updateRegionNameSchema
} from "@dto/region.yup"

import { Controller, Post, HttpCode, Body, Patch, Delete, Param } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"
import { AddRegionResponse, UpdateRegiongResponse, SelectRegiongResponse } from "@type/endpoints"
import { YupValidationPipe } from "src/pipes/yupValidation.pipe"
import { RegionService } from "./region.service"

@ApiTags("region")
@Controller("region")
export class RegionController {
  constructor(private readonly regionSerice: RegionService) {}

  @Post()
  addRegion(
    @Body(new YupValidationPipe(addRegionSchema)) body: AddRegionSchema
  ): Promise<AddRegionResponse> {
    return this.regionSerice.addRegion(body)
  }

  @Patch(":regionId")
  @HttpCode(204)
  updateRegion(
    @Param("regionId") regionId: string,
    @Body(new YupValidationPipe(updateRegionSchema)) body: UpdateRegionSchema
  ): Promise<UpdateRegiongResponse> {
    return this.regionSerice.updateRegion(regionId, body)
  }

  @Patch("/:regionId/select")
  @HttpCode(204)
  selectRegion(
    @Param("regionId") regionId: string,
    @Body(new YupValidationPipe(selectRegionSchema)) body: SelectRegionSchema
  ): Promise<SelectRegiongResponse> {
    return this.regionSerice.selectRegion(regionId, body)
  }

  @Delete(":regionId")
  @HttpCode(204)
  delete(@Param("id") regionId: string) {
    return this.regionSerice.deleteRegion(regionId)
  }

  @Patch("/:regionId/name")
  @HttpCode(204)
  updateName(
    @Param("id") regionId: string,
    @Body(new YupValidationPipe(updateRegionNameSchema)) body: UpdateRegionNameSchema
  ) {
    return this.regionSerice.updateRegionName(regionId, body)
  }
}
