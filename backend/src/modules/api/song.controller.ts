import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Patch,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import * as fs from "fs"

import type { Response } from "express"
import {
  lastTimePositionSchema,
  LastTimePositionSchema,
  updateBeatsSchema,
  UpdateBeatsSchema,
  volumeSchema,
  VolumeSchema
} from "@dto/song.yup"
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
import { ApiTags } from "@nestjs/swagger"

@ApiTags("song")
@Controller("song")
export class SongController {
  constructor(private readonly songService: SongService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  uploadSong(@UploadedFile() file: Express.Multer.File): Promise<UploadSongResponse> {
    return this.songService.uploadSong(file)
  }

  @Get()
  getSongs(): Promise<GetSongsResponse> {
    return this.songService.getSongs()
  }

  @Get(":id")
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

  @Delete(":id")
  @HttpCode(204)
  deleteSong(@Param("id") id: number): Promise<DeleteSongResponse> {
    return this.songService.removeSong(id)
  }

  @Patch("/:songId/beat-config")
  @HttpCode(204)
  updateSongBeats(
    @Param("songId") songId: number,
    @Body(new YupValidationPipe(updateBeatsSchema)) body: UpdateBeatsSchema
  ): Promise<BeatConfigResponse> {
    return this.songService.updateSongBeatConfig(songId, body)
  }

  @Patch("/:songId/select")
  @HttpCode(204)
  updateSongSelected(@Param("songId") songId: number): Promise<SelectSongResponse> {
    return this.songService.updateSelectedSong(songId)
  }

  @Patch("/:songId/last-time-position")
  @HttpCode(204)
  updateLastTimePosition(
    @Param("songId") songId: number,
    @Body(new YupValidationPipe(lastTimePositionSchema)) body: LastTimePositionSchema
  ): Promise<UpdateLastTimePositionResponse> {
    return this.songService.updateLastTimePosition(songId, body)
  }

  @Patch("/:songId/volume")
  @HttpCode(204)
  updateVolume(
    @Param("songId") songId: number,
    @Body(new YupValidationPipe(volumeSchema)) body: VolumeSchema
  ): Promise<UpdateVolumeResponse> {
    return this.songService.updateVolume(songId, body)
  }
}
