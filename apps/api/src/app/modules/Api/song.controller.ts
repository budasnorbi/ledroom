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
import { ApiTags } from "@nestjs/swagger"
import * as fs from "fs"

import {
  lastTimePositionSchema,
  LastTimePositionSchema,
  updateBeatsSchema,
  UpdateBeatsSchema,
  volumeSchema,
  VolumeSchema
} from "@ledroom2/validations"
import {
  UploadSongResponse,
  GetSongsResponse,
  DeleteSongResponse,
  BeatConfigResponse,
  SelectSongResponse,
  UpdateLastTimePositionResponse,
  UpdateVolumeResponse
} from "@ledroom2/types"
import type { Express, Response } from "express"
import { YupValidationPipe } from "../../pipes/yupValidation.pipe"
import { SongService } from "./song.service"
import type { Multer } from "multer"

type File = Express.Multer.File

@ApiTags("song")
@Controller("song")
export class SongController {
  constructor(private readonly songService: SongService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  uploadSong(@UploadedFile() file: File): Promise<UploadSongResponse> {
    return this.songService.uploadSong(file)
  }

  @Get()
  getSongs(): Promise<GetSongsResponse> {
    return this.songService.getSongs()
  }

  @Get(":songId")
  async getSong(
    @Param("songId") songId: number,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    const song = await this.songService.getSongPath(songId)
    const file = fs.createReadStream(song.path)

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Disposition": `attachment; filename="${song.name}"`
    })
    return new StreamableFile(file)
  }

  @Delete(":songId")
  @HttpCode(204)
  deleteSong(@Param("songId") songId: number): Promise<DeleteSongResponse> {
    return this.songService.removeSong(songId)
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
