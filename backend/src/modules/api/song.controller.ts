import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
  UsePipes
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import * as fs from "fs"

import type { Response } from "express"
import { lastTimePositionSchema, LastTimePositionSchema } from "@dto/lastTimePosition.yup"
import { updateBeatsSchema, UpdateBeatsSchema } from "@dto/updateBeats.yup"
import { volumeSchema, VolumeSchema } from "@dto/volume.yup"
import {
  UploadSongResponse,
  GetSongsResponse,
  DeleteSongResponse,
  BeatConfigResponse,
  SelectSongResponse,
  UpdateLastTimePositionResponse,
  UpdateVolumeResponse
} from "@type/endpoints"
import { YupValidationPipe } from "src/pipes/yupValidation.pipe"
import { SongService } from "./song.service"

@Controller("song")
export class SongController {
  constructor(private readonly songService: SongService) {}

  @Post("upload-song")
  @UseInterceptors(FileInterceptor("file"))
  uploadSong(@UploadedFile() file: Express.Multer.File): Promise<UploadSongResponse> {
    return this.songService.uploadSong(file)
  }

  @Get("songs")
  getSongs(): Promise<GetSongsResponse> {
    return this.songService.getSongs()
  }

  @Get("song/:id")
  async getSong(
    @Param("id") id: number,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    const song = await this.songService.getSongPath(id)

    const file = fs.createReadStream(song.path)

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Disposition": `attachment; filename="${song.name}"`
    })
    return new StreamableFile(file)
  }

  @Delete("song/:id")
  @HttpCode(204)
  deleteSong(@Param("id") id: number): Promise<DeleteSongResponse> {
    return this.songService.removeSong(id)
  }

  @Put("beat-config")
  @HttpCode(204)
  @UsePipes(new YupValidationPipe(updateBeatsSchema))
  updateSongBeats(@Body() body: UpdateBeatsSchema): Promise<BeatConfigResponse> {
    return this.songService.updateSongBeatConfig(body)
  }

  @Put("select-song")
  @HttpCode(204)
  updateSongSelected(@Query("id") id: number): Promise<SelectSongResponse> {
    if (isNaN(id)) {
      throw new BadRequestException("Hibás songId")
    }
    return this.songService.updateSelectedSong(id)
  }

  @Put("last-time-position")
  @UsePipes(new YupValidationPipe(lastTimePositionSchema))
  @HttpCode(204)
  updateLastTimePosition(
    @Body() body: LastTimePositionSchema
  ): Promise<UpdateLastTimePositionResponse> {
    return this.songService.updateLastTimePosition(body)
  }

  @Put("volume")
  @UsePipes(new YupValidationPipe(volumeSchema))
  @HttpCode(204)
  updateVolume(@Body() body: VolumeSchema): Promise<UpdateVolumeResponse> {
    return this.songService.updateVolume(body)
  }
}
