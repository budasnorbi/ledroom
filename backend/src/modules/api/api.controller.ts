import { Controller, Post, Body, Get, UsePipes } from "@nestjs/common"
import { YupValidationPipe } from "src/pipes/yupValidation.pipe"

import { ApiService } from "./api.service"

@Controller("api")
export class ApiController {
  constructor(private readonly appService: ApiService) {}

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
