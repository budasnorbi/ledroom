import { Module } from "@nestjs/common"
import { LedModule } from "../Led/led.module"
import { ApiGateway } from "./api.gateway"
import { APP_INTERCEPTOR } from "@nestjs/core"
import { ErrorsInterceptor } from "../../interceptors/errors.interceptor"
import { SongService } from "./song.service"
import { RegionService } from "./region.service"
import { SongController } from "./song.controller"
import { RegionController } from "./region.controller"
import { EffectController } from "./effect.controller"
import { EffectService } from "./effect.service"
import { PrismaService } from "../../prisma.service"

@Module({
  imports: [LedModule],
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
    PrismaService
  ]
})
export class ApiModule {}
