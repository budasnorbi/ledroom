import * as g from "g.js"
import { Injectable } from "@nestjs/common"
import { map } from "../../utils/map"
import { cloneArray } from "../../utils/cloneArray"
import { getBezierCurveY } from "../../utils/bezierCaluclator"
import { rgba2rgb } from "../../utils/rgbaToRgb"

import type { Blink, Step } from "@ledroom2/types"
import type { step_effects } from "@prisma/client"

@Injectable()
export class EffectService {
  private ledCount = 900

  messurmentCount = 0
  avgMessurmentTime: undefined | number

  private blinkStart: undefined | number

  public step(config: any): number[] {
    const frame = cloneArray(config.ledColors)
    /* const { ledColors, barCount, speed, direction, ranges } = config

    const barColor = rgba2rgb(config.barColor)
    const clipColor = rgba2rgb(config.clipColor)

    const timeWindowPosition = (Date.now() / speed) % this.ledCount
    const directionNumber = direction === "left" ? -1 : 1

    for (let i = this.ledCount; i < this.ledCount * 2; i++) {
      const ledIndex = i - this.ledCount
      const byteIndex = ledIndex * 3

      const squareWaveIsUp =
        g.squareWave((i - timeWindowPosition * directionNumber) % this.ledCount, 0, 1, barCount) ===
        1

      for (let k = 0; k < ranges.length; k++) {
        const { start: rangeStart, end: rangeEnd } = ranges[k]

        if (rangeStart < rangeEnd) {
          if (ledIndex >= rangeStart && ledIndex <= rangeEnd) {
            frame[byteIndex] = squareWaveIsUp ? barColor[0] : clipColor[0]
            frame[byteIndex + 1] = squareWaveIsUp ? barColor[1] : clipColor[1]
            frame[byteIndex + 2] = squareWaveIsUp ? barColor[2] : clipColor[2]
          }
        } else {
          if (ledIndex >= rangeStart || ledIndex <= rangeEnd) {
            frame[byteIndex] = squareWaveIsUp ? barColor[0] : clipColor[0]
            frame[byteIndex + 1] = squareWaveIsUp ? barColor[1] : clipColor[1]
            frame[byteIndex + 2] = squareWaveIsUp ? barColor[2] : clipColor[2]
          }
        }
      }
    } */

    return frame
  }

  public blink(config: Blink) {
    const { duration, toColor, ledColors, watchOnlyColored, fromColor, bezierPoints } = config

    if (!this.blinkStart) {
      this.blinkStart = Date.now()
    }

    if (Date.now() >= this.blinkStart + duration * 1000) {
      this.blinkStart = undefined
    }

    const [startLed, endLed] = config.range ?? [0, this.ledCount]

    const frame = cloneArray(ledColors)

    const mappedX = map(Date.now(), this.blinkStart, this.blinkStart + duration * 1000, 0, 1)
    const y = getBezierCurveY(mappedX, bezierPoints)

    const transitionPct = map(y, 0, 1, 0, 100)

    for (let i = 0; i < this.ledCount; i++) {
      const rgbIndex = i * 3

      const frameRed = fromColor ? fromColor[0] : frame[rgbIndex]
      const frameGreen = fromColor ? fromColor[1] : frame[rgbIndex + 1]
      const frameBlue = fromColor ? fromColor[2] : frame[rgbIndex + 2]

      if (watchOnlyColored && frameRed === 0 && frameGreen === 0 && frameBlue === 0) {
        continue
      }

      if (startLed < endLed) {
        if (!(i >= startLed && i <= endLed)) {
          continue
        }
      } else {
        if (!(i >= startLed || i <= endLed)) {
          continue
        }
      }

      // Red
      frame[rgbIndex] = Math.floor(map(transitionPct, 0, 100, frameRed, toColor[0]))
      // Green
      frame[rgbIndex + 1] = Math.floor(map(transitionPct, 0, 100, frameGreen, toColor[1]))
      // Blue
      frame[rgbIndex + 2] = Math.floor(map(transitionPct, 0, 100, frameBlue, toColor[2]))
    }

    return frame
  }

  public clearInternals() {
    this.blinkStart = undefined
  }
}
