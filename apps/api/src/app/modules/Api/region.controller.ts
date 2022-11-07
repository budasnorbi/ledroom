import {
  addRegionSchema,
  AddRegionSchema,
  PatchRegionSchema,
  patchRegionSchema,
} from "@ledroom2/validations";

import {
  Controller,
  Post,
  HttpCode,
  Body,
  Patch,
  Delete,
  Param,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AddRegionResponse, PatchRegionResponse } from "@ledroom2/types";
import { YupValidationPipe } from "../../pipes/yupValidation.pipe";
import { RegionService } from "./region.service";

@ApiTags("region")
@Controller("region")
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Post()
  addRegion(
    @Body(new YupValidationPipe(addRegionSchema)) body: AddRegionSchema
  ): Promise<AddRegionResponse> {
    return this.regionService.addRegion(body);
  }

  @Patch(":regionId")
  @HttpCode(204)
  patchRegion(
    @Param("regionId") regionId: string,
    @Body(new YupValidationPipe(patchRegionSchema)) body: PatchRegionSchema
  ): Promise<PatchRegionResponse> {
    return this.regionService.patchRegion(regionId, body);
  }

  @Delete(":regionId")
  @HttpCode(204)
  delete(@Param("regionId") regionId: string) {
    return this.regionService.deleteRegion(regionId);
  }
}
