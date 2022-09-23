import { addRegionSchema, AddRegionSchema } from "@dto/addRegion.yup"
import { selectRegionSchema, SelectRegionSchema } from "@dto/selectRegion"
import { updateRegionSchema, UpdateRegionSchema } from "@dto/updateRegion.yup"
import { Controller, Post, UsePipes, HttpCode, Body, Put, Delete, Query } from "@nestjs/common"
import { AddRegionResponse, UpdateRegiongResponse, SelectRegiongResponse } from "@type/endpoints"
import { YupValidationPipe } from "src/pipes/yupValidation.pipe"
import { RegionService } from "./region.service"

@Controller("api")
export class RegionController {
  constructor(private readonly regionSerice: RegionService) {}

  @Post("region")
  @UsePipes(new YupValidationPipe(addRegionSchema))
  @HttpCode(204)
  addRegion(@Body() body: AddRegionSchema): Promise<AddRegionResponse> {
    return this.regionSerice.addRegion(body)
  }

  @Put("region")
  @UsePipes(new YupValidationPipe(updateRegionSchema))
  @HttpCode(204)
  updateRegion(@Body() body: UpdateRegionSchema): Promise<UpdateRegiongResponse> {
    return this.regionSerice.updateRegion(body)
  }

  @Put("select-region")
  @UsePipes(new YupValidationPipe(selectRegionSchema))
  @HttpCode(204)
  selectRegion(@Body() body: SelectRegionSchema): Promise<SelectRegiongResponse> {
    return this.regionSerice.selectRegion(body)
  }

  @Delete("region")
  @HttpCode(204)
  deleteRegion(@Query("id") regionId: string) {
    return this.regionSerice.deleteRegion(regionId)
  }
}
