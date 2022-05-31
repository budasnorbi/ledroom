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
  private redBuffer = createLedsColorsArr(255, 0, 0)
  private greenBuffer = createLedsColorsArr(0, 255, 0)
  private blueBuffer = createLedsColorsArr(0, 0, 255)
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

  t1Colors = [createLedsColorsArr(0, 255, 0), createLedsColorsArr(0, 0, 0)]
  t2Colors = [createLedsColorsArr(0, 0, 255), createLedsColorsArr(0, 255, 0)]
  t3Colors = [createLedsColorsArr(0, 0, 255), createLedsColorsArr(0, 255, 255)]
  t4Colors = [createLedsColorsArr(0, 255, 255), createLedsColorsArr(0, 255, 0)]
  t5Colors = [createLedsColorsArr(0, 0, 0), createLedsColorsArr(0, 0, 255)]
  redColor = createLedsColorsArr(255, 0, 0)

  private w1 = [682, 74]
  private w2 = [75, 305]
  private w3 = [306, 493]
  private w4 = [494, 681]

  songEffect(time: number) {
    let ledColors = this.effectService.step({
      barColorOrLed: [0, 255, 0],
      clipLed: [0, 0, 0],
      barCount: 50,
      speed: 8
    })

    ledColors = this.effectService.blink({
      currentColorOrLed: ledColors,
      toColor: [0, 0, 255],
      watchOnlyColored: true,
      duration: 3
    })

    return ledColors

    // if (time >= 38.26771653543307 && time < 52.91338582677165) {
    //   return this.effectService.blink({
    //     currentColor: this.t1Colors[1],
    //     toColor: this.t1Colors[0],
    //     duration: 1 / (127 / 60)
    //   })
    // } else if (time >= 52.91338582677165 && time < 60.47244094488189) {
    //   return this.effectService.blink({
    //     currentColor: this.t1Colors[1],
    //     toColor: this.t1Colors[0],
    //     duration: 1 / (127 / 60) / 2
    //   })
    // } else if (time >= 60.47244094488189 && time < 64.25196850393701) {
    //   return this.effectService.blink({
    //     currentColor: this.t3Colors[1],
    //     toColor: this.t3Colors[0],
    //     duration: 1 / (127 / 60) / 4
    //   })
    // } else if (time >= 64.25196850393701 && time < 68.03149606299212) {
    //   return this.effectService
    //     .step({
    //       barColor: [0, 255, 0],
    //       clipColor: [0, 0, 0],
    //       barCount: 200,
    //       speed: 1000 / 60
    //     })
    //     .blink({
    //       currentColor: "chain",
    //       toColor: this.t5Colors[0],
    //       duration: 1 / (127 / 60) / 8
    //     })
    // } else if (time >= 68.03149606299212) {
    //   return this.effectService.blink({
    //     toColor: this.t5Colors[0],
    //     currentColor: this.t5Colors[1],
    //     duration: 1 / (127 / 60) / 0.5
    //   })
    // } else {
    //   return this.blackBuffer
    // }
  }

  stop() {
    this.clearIntervals()
  }

  seek(time: number) {
    this.updateTime(time)
    this.clearIntervals()
    this.effectService.clearInternals()

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
