import { Module } from "@nestjs/common"
import { ApiController } from "./api.controller"
import { ApiService } from "./api.service"
import { LedModule } from "../Led/led.module"
import { ApiGateway } from "./api.gateway"

@Module({
  imports: [LedModule],
  controllers: [ApiController],
  providers: [ApiService, ApiGateway]
})
export class ApiModule {}
