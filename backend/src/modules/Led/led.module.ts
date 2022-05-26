import { Module } from "@nestjs/common"
import { LedService } from "./led.service"
import { UdpModule } from "../Udp/udp.module"
import { EffectModule } from "@modules/Effect/effect.module"

@Module({
  providers: [LedService],
  imports: [UdpModule, EffectModule],
  exports: [LedService]
})
export class LedModule {}
