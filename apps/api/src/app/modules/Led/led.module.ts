import { Module } from "@nestjs/common"
import { LedService } from "./led.service"
import { UdpModule } from "../Udp/udp.module"
import { EffectModule } from "../Effect/effect.module"
import { PrismaService } from "../../prisma.service"

@Module({
  imports: [UdpModule, EffectModule],
  exports: [LedService],
  providers: [LedService, PrismaService]
})
export class LedModule {}
