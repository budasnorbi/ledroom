import { Module } from "@nestjs/common"
import { LedService } from "./led.service"
import { UdpModule } from "../Udp/udp.module"
import { EffectModule } from "../Effect/effect.module"
import { Region } from "@ledroom2/models"
import { Song } from "@ledroom2/models"
import { StepEffect } from "@ledroom2/models"
import { TypeOrmModule } from "@nestjs/typeorm"
import { RegionsRepository } from "../../repositories/Regions.repository"
import { SongsRepository } from "../../repositories/Songs.repository"
import { StepEffectRepository } from "../../repositories/StepEffect.repository"

@Module({
  imports: [UdpModule, EffectModule, TypeOrmModule.forFeature([Song, Region, StepEffect])],
  exports: [LedService],
  providers: [LedService, SongsRepository, RegionsRepository, StepEffectRepository]
})
export class LedModule {}
