import { Module } from "@nestjs/common"
import { ApiController } from "./api.controller"
import { ApiService } from "./api.service"
import { LedModule } from "../Led/led.module"
import { ApiGateway } from "./api.gateway"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Songs } from "@entities/Songs"
import { SongsRepository } from "@repositories/Songs.repository"
import { Regions } from "@entities/Regions"
import { RegionsRepository } from "@repositories/Regions.repository"
import { APP_INTERCEPTOR } from "@nestjs/core"
import { ErrorsInterceptor } from "@interceptors/errors.interceptor"

@Module({
  imports: [LedModule, TypeOrmModule.forFeature([Songs, Regions])],
  controllers: [ApiController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorsInterceptor
    },
    ApiService,
    ApiGateway,
    SongsRepository,
    RegionsRepository
  ]
})
export class ApiModule {}
