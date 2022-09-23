import { Module } from "@nestjs/common"
import { LedModule } from "../Led/led.module"
import { ApiGateway } from "./api.gateway"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Song } from "@entities/Song.entity"
import { SongsRepository } from "@repositories/Songs.repository"
import { Region } from "@entities/Region.entity"
import { RegionsRepository } from "@repositories/Regions.repository"
import { APP_INTERCEPTOR } from "@nestjs/core"
import { ErrorsInterceptor } from "@interceptors/errors.interceptor"
import { Effect } from "@entities/Effect.entity"
import { SongService } from "./song.service"
import { RegionService } from "./region.service"
import { SongController } from "./song.controller"
import { RegionController } from "./region.controller"

@Module({
  imports: [LedModule, TypeOrmModule.forFeature([Song, Region, Effect])],
  controllers: [SongController, RegionController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorsInterceptor
    },
    SongService,
    RegionService,
    ApiGateway,
    SongsRepository,
    RegionsRepository
  ]
})
export class ApiModule {}
