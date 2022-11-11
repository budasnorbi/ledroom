import { Module } from "@nestjs/common"
import { EffectService } from "./effect.service"

@Module({
  providers: [EffectService],
  exports: [EffectService]
})
export class EffectModule {}
