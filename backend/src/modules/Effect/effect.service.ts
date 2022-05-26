import { Injectable } from "@nestjs/common"
import { map } from "@helpers/map"

@Injectable()
export class EffectService {
  private freq = 10
  private ledCount = 900
  private fps: number = 1000 / 60

  private getWindowPosition(time: number) {
    return (time / this.fps) % this.ledCount
  }

  private initialStart: undefined | number
  public blink(
    yGenerator: (mappedX: number) => number,
    currentColor: number[],
    toColor: number[],
    duration: number
  ) {
    if (!this.initialStart) {
      this.initialStart = Date.now()
    }
    if (Date.now() >= this.initialStart + duration * 1000) {
      this.initialStart = undefined
      return toColor
    }

    const mappedX = map(
      Date.now(),
      this.initialStart,
      this.initialStart + duration * 1000,
      0,
      Math.PI
    )

    const y = yGenerator(mappedX)
    const transitionPct = map(y, 0, 2, 0, 100)

    const frame: number[] = []
    for (let i = 0; i < 2700; i += 3) {
      frame.push(
        Math.floor(map(transitionPct, 0, 100, currentColor[i], toColor[i])),
        Math.floor(map(transitionPct, 0, 100, currentColor[i + 1], toColor[i + 1])),
        Math.floor(map(transitionPct, 0, 100, currentColor[i + 2], toColor[i + 2]))
      )
    }

    return frame
  }
}
