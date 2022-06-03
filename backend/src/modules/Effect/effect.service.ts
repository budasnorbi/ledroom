import { Injectable } from "@nestjs/common"
import { map } from "@helpers/map"
import * as g from "g.js"
import { cloneArray } from "@helpers/cloneArray"
import { Blink, Starlight, Step } from "@type/effetc"

@Injectable()
export class EffectService {
  private ledCount = 900

  messurmentCount = 0
  avgMessurmentTime: undefined | number

  private blinkStart: undefined | number
  private startList: any = []

  starlight(config: Starlight): number[] {
    const { ledColors } = config
    const frame = cloneArray(ledColors)

    return frame
  }

  public step(config: Step): number[] {
    const { ledColors, barCount, clipLed, speed, direction, barColor } = config
    const [startLed, endLed] = config.range ?? [0, this.ledCount]

    const timeWindowPosition = (Date.now() / speed) % this.ledCount

    const frame = cloneArray(ledColors)
    const directionNumber = direction === "left" ? -1 : 1

    // Ez akkor hasznos ha van egy hátterünk és azon eltérő barColort szeretnénk
    if (barColor) {
      for (let i = this.ledCount; i < this.ledCount * 2; i++) {
        if (
          g.squareWave(
            (i - timeWindowPosition * directionNumber) % this.ledCount,
            0,
            1,
            barCount
          ) === 1
        ) {
          const ledIndex = i - this.ledCount
          const byteIndex = ledIndex * 3

          // LINEAR BRIGHTNESS INCREASING
          let brightnessMultipler = map(
            ((i - timeWindowPosition * directionNumber) % this.ledCount) % (barCount / 2),
            0,
            barCount / 2,
            0,
            1 * directionNumber
          )

          if (brightnessMultipler === 0.5) {
            brightnessMultipler = 1
          }

          if (brightnessMultipler > 0.5) {
            brightnessMultipler = 1 - brightnessMultipler
          }

          if (startLed < endLed) {
            if (ledIndex >= startLed && ledIndex <= endLed) {
              frame[byteIndex] = Math.round(barColor[0] * brightnessMultipler)
              frame[byteIndex + 1] = Math.round(barColor[1] * brightnessMultipler)
              frame[byteIndex + 2] = Math.round(barColor[2] * brightnessMultipler)
            }
          } else {
            if (ledIndex >= startLed || ledIndex <= endLed) {
              frame[byteIndex] = Math.round(barColor[0] * brightnessMultipler)
              frame[byteIndex + 1] = Math.round(barColor[1] * brightnessMultipler)
              frame[byteIndex + 2] = Math.round(barColor[2] * brightnessMultipler)
            }
          }
        } else {
          const ledIndex = i - this.ledCount
          const byteIndex = ledIndex * 3

          if (startLed < endLed) {
            if (ledIndex >= startLed && ledIndex <= endLed) {
              frame[byteIndex] = clipLed[0]
              frame[byteIndex + 1] = clipLed[1]
              frame[byteIndex + 2] = clipLed[2]
            }
          } else {
            if (ledIndex >= startLed || ledIndex <= endLed) {
              frame[byteIndex] = clipLed[0]
              frame[byteIndex + 1] = clipLed[1]
              frame[byteIndex + 2] = clipLed[2]
            }
          }
        }
      }
    } else {
      for (let i = this.ledCount; i < this.ledCount * 2; i++) {
        if (
          g.squareWave(
            (i - timeWindowPosition * directionNumber) % this.ledCount,
            0,
            1,
            barCount
          ) === 1
        ) {
          const ledIndex = i - this.ledCount
          const byteIndex = ledIndex * 3

          if (startLed < endLed) {
            if (ledIndex >= startLed && ledIndex <= endLed) {
              frame[byteIndex] = clipLed[0]
              frame[byteIndex + 1] = clipLed[1]
              frame[byteIndex + 2] = clipLed[2]
            }
          } else {
            if (ledIndex >= startLed || ledIndex <= endLed) {
              frame[byteIndex] = clipLed[0]
              frame[byteIndex + 1] = clipLed[1]
              frame[byteIndex + 2] = clipLed[2]
            }
          }
        }
      }
    }

    return frame
  }

  public blink(config: Blink) {
    const { duration, toColor, ledColors, yGenerator, watchOnlyColored, fromColor } = config

    if (!this.blinkStart) {
      this.blinkStart = Date.now()
    }

    if (Date.now() >= this.blinkStart + duration * 1000) {
      this.blinkStart = undefined
    }

    const [startLed, endLed] = config.range ?? [0, this.ledCount]

    const frame = cloneArray(ledColors)

    const mappedX = map(Date.now(), this.blinkStart, this.blinkStart + duration * 1000, 0, Math.PI)
    const y = yGenerator ? yGenerator(mappedX) : Math.sin(mappedX - Math.PI / 2) + 1
    const transitionPct = map(y, 0, 2, 0, 100)

    for (let i = 0; i < this.ledCount; i++) {
      const actualIndex = i * 3

      const frameRed = fromColor ? fromColor[0] : frame[actualIndex]
      const frameGreen = fromColor ? fromColor[1] : frame[actualIndex + 1]
      const frameBlue = fromColor ? fromColor[2] : frame[actualIndex + 2]

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
      frame[actualIndex] = Math.floor(map(transitionPct, 0, 100, frameRed, toColor[0]))
      // Green
      frame[actualIndex + 1] = Math.floor(map(transitionPct, 0, 100, frameGreen, toColor[1]))
      // Blue
      frame[actualIndex + 2] = Math.floor(map(transitionPct, 0, 100, frameBlue, toColor[2]))
    }

    return frame
  }

  public clearInternals() {
    this.blinkStart = undefined
  }
}
