import { createLedsColorsArr } from "@helpers/createLedsColorsArr"
import { EffectService } from "@modules/Effect/effect.service"
import { Injectable } from "@nestjs/common"
import { Region } from "@type/socket"
import { UdpService } from "../Udp/udp.service"
import { Server } from "socket.io"
import { fixColorOrder } from "@helpers/fixLedColorOrder"

@Injectable()
export class LedService {
  private ledFrameIntervalID: undefined | NodeJS.Timeout
  private fps = 60
  private musicTime = 0
  private blackBuffer = createLedsColorsArr([0, 0, 0])
  private redBuffer = createLedsColorsArr([255, 0, 0])
  private greenBuffer = createLedsColorsArr([0, 255, 0])
  private blueBuffer = createLedsColorsArr([0, 0, 255])
  private whiteBuffer = createLedsColorsArr([255, 255, 255])
  private regions: Region[] = []

  private wholeRange: [number, number] = [0, 826]
  private agyFalRange: [number, number] = [75, 306]
  private ablakFalRange: [number, number] = [307, 493]
  private kanapeFalRange: [number, number] = [494, 681]
  private butonFalRange: [number, number] = [682, 780]
  private butorKilogasFalRange: [number, number] = [780, 815]
  private ajtoFalRange: [number, number] = [816, 74]
  private currentFrame: number[]

  constructor(private udpService: UdpService, private effectService: EffectService) {
    // const ledColors = this.effectService.step({
    //   ledColor: this.blackBuffer,
    //   barColor: [0, 0, 255],
    //   clipLed: [0, 0, 0],
    //   barCount: 50,
    //   direction: "left",
    //   speed: 1000 / 60,
    //   range: this.w1
    // })
  }

  handleSocketAfterInit(socket: Server) {
    const colors = createLedsColorsArr([0, 0, 255], this.wholeRange)
    const fixedColors = fixColorOrder(colors)

    /*     setTimeout(() => {
      const colors = createLedsColorsArr([0, 0, 0], this.wholeRange)
      const fixedColors = fixColorOrder(colors)
      socket.emit("frame", colors)
      this.udpService.sendData(fixedColors)
    }, 1500) */

    socket.emit("frame", colors)
    this.udpService.sendData(fixedColors)
  }

  updateTime(time: number) {
    this.musicTime = time
  }

  start(time: number, socket: Server) {
    this.updateTime(time)

    if (!this.ledFrameIntervalID) {
      const fpsTick = () => {
        const colors = this.songEffect(this.musicTime)
        const fixedColors = fixColorOrder(colors)

        socket.emit("frame", colors)
        this.udpService.sendData(fixedColors)
      }

      this.ledFrameIntervalID = setInterval(fpsTick, 1000 / this.fps)
    }
  }

  private x = 0

  songEffect(time: number) {
    const ledColors = this.blackBuffer

    // for (let i = 0; i < this.regions.length; i++) {
    //   if (time >= this.regions[i].startTime && time <= this.regions[i].endTime) {
    //     // Current effect region
    //     // ledColors = this.effectService.step({
    //     //   ledColors: this.blackBuffer,
    //     //   barColor: [0, 0, 255],
    //     //   clipLed: [0, 0, 0],
    //     //   barCount: 50,
    //     //   direction: "right",
    //     //   speed: 1000 / 60
    //     // })
    //   }
    // }

    // ledColors = this.effectService.step({
    //   ledColor: ledColors,
    //   barColor: [0, 0, 255],
    //   clipLed: [0, 0, 0],
    //   barCount: 50,
    //   direction: "right",
    //   speed: 1000 / 60,
    //   range: this.w3
    // })

    // ledColors = this.effectService.step({
    //   ledColor: ledColors,
    //   barColor: [0, 255, 0],
    //   clipLed: [0, 0, 0],
    //   barCount: 25,
    //   direction: "left",
    //   speed: 1000 / 60,
    //   range: this.w2
    // })

    // ledColors = this.effectService.step({
    //   ledColor: ledColors,
    //   barColor: [0, 255, 0],
    //   clipLed: [0, 0, 0],
    //   barCount: 25,
    //   direction: "left",
    //   speed: 1000 / 60,
    //   range: this.w4
    // })

    // ledColors = this.effectService.blink({
    //   currentColorOrLed: ledColors,
    //   toColor: [0, 0, 255],
    //   watchOnlyColored: true,
    //   duration: 1
    // })

    if (time >= 38.26771653543307 && time < 52.91338582677165) {
      return this.effectService.blink({
        ledColors: this.blackBuffer,
        toColor: [0, 255, 0],
        duration: 1,
        bezierPoints: [1, 0, 1, 0]
      })
    } else if (time >= 52.91338582677165 && time < 60.47244094488189) {
      return this.effectService.blink({
        ledColors: this.blackBuffer,
        toColor: [0, 255, 0],
        duration: 1 / (127 / 60) / 2,
        bezierPoints: [0, 1, 0, 1]
      })
    } else if (time >= 60.47244094488189 && time < 64.25196850393701) {
      return this.effectService.blink({
        ledColors: this.blackBuffer,
        toColor: [0, 255, 0],
        duration: 1 / (127 / 60) / 4,
        bezierPoints: [0, 1, 0, 1]
      })
    } else if (time >= 64.25196850393701) {
      return this.effectService.step({
        ledColors: this.blackBuffer,
        barColor: [0, 0, 255],
        clipLed: [0, 0, 0],
        barCount: 50,
        direction: "right",
        speed: 1000 / 60
      })
    }
    return ledColors
  }

  stop() {
    this.clearIntervals()
  }

  seek(time: number, socket: Server) {
    this.updateTime(time)
    this.clearIntervals()
    this.effectService.clearInternals()

    const colors = this.songEffect(this.musicTime)
    const fixedColors = fixColorOrder(colors)

    socket.emit("frame", colors)
    this.udpService.sendData(fixedColors)
  }

  reset() {
    this.regions = []
    this.clearIntervals()
    this.musicTime = 0
  }

  private clearIntervals() {
    clearInterval(this.ledFrameIntervalID)
    this.ledFrameIntervalID = undefined
  }

  public updateRegions(regions: Region[]) {
    this.regions = regions
  }
}
