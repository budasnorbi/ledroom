import {
  Controller,
  Post,
  Body,
  Get,
  UsePipes,
  UploadedFile,
  UseInterceptors,
  Query,
  Res,
  StreamableFile,
  Delete,
  Put,
  Param,
  BadRequestException
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import * as fs from "fs"

import { UpdateBeatsSchema, updateBeatsSchema } from "@dto/updateBeats.yup"
import { YupValidationPipe } from "../../pipes/yupValidation.pipe"
import { ApiService } from "./api.service"
import { LastTimePositionSchema, lastTimePositionSchema } from "@dto/lastTimePosition.yup"
import { VolumeSchema, volumeSchema } from "@dto/volume.yup"
import { AddRegionSchema, addRegionSchema } from "@dto/addRegion.yup"
import { UpdateRegionSchema, updateRegionSchema } from "@dto/updateRegion.yup"
import { SelectRegionSchema, selectRegionSchema } from "@dto/selectRegion"
import { Response } from "express"
import {
  AddRegionResponse,
  BeatConfigResponse,
  DeleteSongResponse,
  GetSongsResponse,
  SelectRegiongResponse,
  SelectSongResponse,
  UpdateLastTimePositionResponse,
  UpdateRegiongResponse,
  UpdateVolumeResponse,
  UploadSongResponse
} from "@type/endpoints"

@Controller("api")
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Post("upload-song")
  @UseInterceptors(FileInterceptor("file"))
  uploadSong(@UploadedFile() file: Express.Multer.File): Promise<UploadSongResponse> {
    return this.apiService.uploadSong(file)
  }

  @Get("songs")
  getSongs(): Promise<GetSongsResponse> {
    return this.apiService.getSongs()
  }

  @Get("song/:id")
  async getSong(
    @Param("id") id: number,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    const song = await this.apiService.getSongPath(id)

    const file = fs.createReadStream(song.path)

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Disposition": `attachment; filename="${song.name}"`
    })
    return new StreamableFile(file)
  }

  @Delete("song/:id")
  async deleteSong(@Param("id") id: number): Promise<DeleteSongResponse> {
    return this.apiService.removeSong(id)
  }

  @Put("beat-config")
  @UsePipes(new YupValidationPipe(updateBeatsSchema))
  updateSongBeats(@Body() body: UpdateBeatsSchema): Promise<BeatConfigResponse> {
    return this.apiService.updateBeats(body)
  }

  @Put("select-song")
  updateSongSelected(@Query("id") id: number): Promise<SelectSongResponse> {
    if (isNaN(id)) {
      throw new BadRequestException("Hibás songId")
    }
    return this.apiService.updateSongSelected(id)
  }

  @Put("last-time-position")
  @UsePipes(new YupValidationPipe(lastTimePositionSchema))
  updateLastTimePosition(
    @Body() body: LastTimePositionSchema
  ): Promise<UpdateLastTimePositionResponse> {
    return this.apiService.updateLastTimePosition(body)
  }

  @Put("volume")
  @UsePipes(new YupValidationPipe(volumeSchema))
  updateVolume(@Body() body: VolumeSchema): Promise<UpdateVolumeResponse> {
    return this.apiService.updateVolume(body)
  }

  @Post("region")
  @UsePipes(new YupValidationPipe(addRegionSchema))
  addRegion(@Body() body: AddRegionSchema): Promise<AddRegionResponse> {
    return this.apiService.addRegion(body)
  }

  @Put("region")
  @UsePipes(new YupValidationPipe(updateRegionSchema))
  updateRegion(@Body() body: UpdateRegionSchema): Promise<UpdateRegiongResponse> {
    return this.apiService.updateRegion(body)
  }

  @Put("select-region")
  @UsePipes(new YupValidationPipe(selectRegionSchema))
  selectRegion(@Body() body: SelectRegionSchema): Promise<SelectRegiongResponse> {
    return this.apiService.selectRegion(body)
  }

  @Delete("regions/:songId")
  deleteRegions(@Param("songId") songId: number) {
    return this.apiService.deleteRegions(songId)
  }

  // @Post("play")
  // @UsePipes(new YupValidationPipe(playSchema))
  // play(@Body() body: PlaySchema) {
  //   return this.appService.play(body)
  // }

  // @Get("pause")
  // pause() {
  //   return this.appService.pause()
  // }

  // @Post("seek")
  // @UsePipes(new YupValidationPipe(seekSchema))
  // seek(@Body() body: SeekSchema) {
  //   return this.appService.seek(body)
  // }

  // @Get("reset")
  // reset() {
  //   return this.appService.reset()
  // }
}
