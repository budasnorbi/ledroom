import { createLedsColorsArr } from "@helpers/createLedsColorsArr"
import { EffectService } from "@modules/Effect/effect.service"
import { Injectable } from "@nestjs/common"
import { UdpService } from "../Udp/udp.service"

@Injectable()
export class LedService {
  private ledFrameIntervalID: undefined | NodeJS.Timeout
  private fps = 60
  private musicTime = 0
  private blackBuffer = createLedsColorsArr(0, 0, 0)
  private whiteBuffer = createLedsColorsArr(255, 255, 255)

  constructor(private udpService: UdpService, private effectService: EffectService) {
    this.udpService.sendData(this.blackBuffer)
  }

  updateTime(time: number) {
    this.musicTime = time
  }

  start(time: number) {
    this.updateTime(time)

    if (!this.ledFrameIntervalID) {
      const fpsTick = () => {
        const frameBuffer = this.songEffect(this.musicTime)
        this.udpService.sendData(frameBuffer)
      }

      this.ledFrameIntervalID = setInterval(fpsTick, 1000 / this.fps)
    }
  }

  t1Colors = [createLedsColorsArr(0, 0, 0), createLedsColorsArr(0, 255, 0)]
  t2Colors = [createLedsColorsArr(0, 0, 255), createLedsColorsArr(0, 255, 0)]
  t3Colors = [createLedsColorsArr(0, 0, 255), createLedsColorsArr(0, 255, 255)]
  t4Colors = [createLedsColorsArr(0, 255, 255), createLedsColorsArr(0, 255, 0)]
  t5Colors = [createLedsColorsArr(0, 255, 0), createLedsColorsArr(0, 0, 255)]

  songEffect(time: number): number[] {
    return this.effectService.blink(
      (mappedX) => Math.sin(mappedX - Math.PI / 2) + 1,
      this.t1Colors[0],
      this.t1Colors[1],
      1
    )
    if (time >= 38.26771653543307 && time < 52.91338582677165) {
      return this.effectService.blink(
        (mappedX) => Math.sin(mappedX - Math.PI / 2) + 1,
        this.t1Colors[0],
        this.t1Colors[1],
        0.6
      )
    } else if (time >= 52.91338582677165 && time < 60.47244094488189) {
      return this.effectService.blink(
        (mappedX) => Math.sin(mappedX - Math.PI / 2) + 1,
        this.t2Colors[0],
        this.t2Colors[1],
        0.45
      )
    } else if (time >= 60.47244094488189 && time < 64.25196850393701) {
      return this.effectService.blink(
        (mappedX) => Math.sin(mappedX - Math.PI / 2) + 1,
        this.t3Colors[0],
        this.t3Colors[1],
        0.15
      )
    } else if (time >= 64.25196850393701 && time < 68.03149606299212) {
      return this.effectService.blink(
        (mappedX) => Math.sin(mappedX - Math.PI / 2) + 1,
        this.t4Colors[0],
        this.t4Colors[1],
        0.05
      )
    } else if (time >= 68.03149606299212) {
      return this.effectService.blink(
        (mappedX) => Math.sin(mappedX - Math.PI / 2) + 1,
        this.t5Colors[0],
        this.t5Colors[1],
        1
      )
    } else {
      return this.blackBuffer
    }
  }

  stop() {
    this.clearIntervals()
  }

  seek(time: number) {
    this.updateTime(time)
    this.clearIntervals()

    const frameBuffer = this.songEffect(this.musicTime)
    this.udpService.sendData(frameBuffer)
  }

  reset() {
    this.clearIntervals()
    this.musicTime = 0
  }

  private clearIntervals() {
    clearInterval(this.ledFrameIntervalID)
    this.ledFrameIntervalID = undefined
  }
}
