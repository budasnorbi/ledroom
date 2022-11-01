import { Module } from "@nestjs/common"
import { LedModule } from "../Led/led.module"
import { ApiGateway } from "./api.gateway"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Song, Region, StepEffect } from "@ledroom2/models"
import { SongsRepository } from "../../repositories/Songs.repository"
import { RegionsRepository } from "../../repositories/Regions.repository"
import { APP_INTERCEPTOR } from "@nestjs/core"
import { ErrorsInterceptor } from "../../interceptors/errors.interceptor"
import { SongService } from "./song.service"
import { RegionService } from "./region.service"
import { SongController } from "./song.controller"
import { RegionController } from "./region.controller"
import { EffectController } from "./effect.controller"
import { EffectService } from "./effect.service"
import { StepEffectRepository } from "../../repositories/StepEffect.repository"

@Module({
  imports: [LedModule, TypeOrmModule.forFeature([Song, Region, StepEffect])],
  controllers: [SongController, RegionController, EffectController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorsInterceptor
    },
    SongService,
    RegionService,
    EffectService,
    ApiGateway,
    SongsRepository,
    RegionsRepository,
    StepEffectRepository
  ]
})
export class ApiModule {}
