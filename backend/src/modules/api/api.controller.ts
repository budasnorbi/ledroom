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
  Param
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

@Controller("api")
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Post("upload-song")
  @UseInterceptors(FileInterceptor("file"))
  uploadSong(@UploadedFile() file: Express.Multer.File) {
    return this.apiService.uploadSong(file)
  }

  @Get("songs")
  songNames() {
    return this.apiService.getSongs()
  }

  @Get("song")
  async getSong(@Query("id") id: number, @Res({ passthrough: true }) res): Promise<StreamableFile> {
    const song = await this.apiService.getSongPath(id)

    const file = fs.createReadStream(song.path)

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Disposition": `attachment; filename="${song.name}"`
    })
    return new StreamableFile(file)
  }

  @Delete("song")
  async deleteSong(@Query("id") id: number) {
    return this.apiService.removeSong(id)
  }

  @Put("beat-config")
  @UsePipes(new YupValidationPipe(updateBeatsSchema))
  updateSongBeats(@Body() body: UpdateBeatsSchema) {
    return this.apiService.updateBeats(body)
  }

  @Put("last-time-position")
  @UsePipes(new YupValidationPipe(lastTimePositionSchema))
  updateLastTimePosition(@Body() body: LastTimePositionSchema) {
    return this.apiService.updateLastTimePosition(body)
  }

  @Put("volume")
  @UsePipes(new YupValidationPipe(volumeSchema))
  updateVolume(@Body() body: VolumeSchema) {
    return this.apiService.updateVolume(body)
  }

  @Post("region")
  @UsePipes(new YupValidationPipe(addRegionSchema))
  addRegion(@Body() body: AddRegionSchema) {
    return this.apiService.addRegion(body)
  }

  @Put("region")
  @UsePipes(new YupValidationPipe(updateRegionSchema))
  updateRegion(@Body() body: UpdateRegionSchema) {
    return this.apiService.updateRegion(body)
  }

  @Put("select-region")
  @UsePipes(new YupValidationPipe(selectRegionSchema))
  selectRegion(@Body() body: SelectRegionSchema) {
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
