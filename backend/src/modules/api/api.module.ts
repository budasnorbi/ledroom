import { Module } from "@nestjs/common"
import { ApiController } from "./api.controller"
import { ApiService } from "./api.service"
import { LedModule } from "../Led/led.module"
import { ApiGateway } from "./api.gateway"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Songs } from "@entities/Songs"
import { SongsRepository } from "@repositories/Songs.repository"

@Module({
  imports: [LedModule, TypeOrmModule.forFeature([Songs])],
  controllers: [ApiController],
  providers: [ApiService, ApiGateway, SongsRepository]
})
export class ApiModule {}
