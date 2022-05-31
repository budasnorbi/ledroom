import { Injectable } from "@nestjs/common"
import { map } from "@helpers/map"
import * as g from "g.js"
import { cloneArray } from "@helpers/cloneArray"

interface Blink {
  yGenerator?: (mappedX: number) => number
  currentColorOrLed: [number, number, number] | number[]
  toColor: number[]
  watchOnlyColored: boolean
  duration: number
}

interface Step {
  barColorOrLed: [number, number, number] | number[]
  clipLed: [number, number, number]
  speed: number
  barCount: number
  direction: "left" | "right"
}

@Injectable()
export class EffectService {
  private ledCount = 900

  messurmentCount = 0
  avgMessurmentTime: undefined | number

  private blinkStart: undefined | number

  public step(config: Step): number[] {
    const { barColorOrLed, barCount, clipLed, speed, direction } = config
    const timeWindowPosition = (Date.now() / speed) % this.ledCount

    const frame = barColorOrLed.length === 3 ? [] : cloneArray(barColorOrLed)
    const directionNumber = direction === "left" ? -1 : 1

    if (barColorOrLed.length === 3) {
      for (let i = this.ledCount; i < this.ledCount * 2; i++) {
        if (
          g.squareWave(
            (i - timeWindowPosition * directionNumber) % this.ledCount,
            0,
            1,
            barCount
          ) === 1
        ) {
          frame.push(clipLed[0], clipLed[1], clipLed[2])
        } else {
          frame.push(barColorOrLed[0], barColorOrLed[1], barColorOrLed[2])
        }
      }
    }

    if (barColorOrLed.length === this.ledCount * 3) {
      for (let i = this.ledCount; i < this.ledCount * 2; i++) {
        if (
          g.squareWave(
            (i - timeWindowPosition * directionNumber) % this.ledCount,
            0,
            1,
            barCount
          ) === 1
        ) {
          const actualIndex = (i - this.ledCount) * 3
          frame[actualIndex] = clipLed[0]
          frame[actualIndex + 1] = clipLed[1]
          frame[actualIndex + 2] = clipLed[2]
        }
      }
    }

    return frame
  }

  public blink(config: Blink) {
    const { duration, toColor, currentColorOrLed, yGenerator, watchOnlyColored } = config

    if (!this.blinkStart) {
      this.blinkStart = Date.now()
    }

    if (Date.now() >= this.blinkStart + duration * 1000) {
      this.blinkStart = undefined
    }

    const frame = currentColorOrLed.length === 3 ? [] : cloneArray(currentColorOrLed)

    const mappedX = map(Date.now(), this.blinkStart, this.blinkStart + duration * 1000, 0, Math.PI)
    const y = yGenerator ? yGenerator(mappedX) : Math.sin(mappedX - Math.PI / 2) + 1
    const transitionPct = map(y, 0, 2, 0, 100)

    if (currentColorOrLed.length === 3) {
      // If i pass only a color
      for (let i = 0; i < this.ledCount; i++) {
        frame.push(
          // Red
          Math.floor(map(transitionPct, 0, 100, currentColorOrLed[0], toColor[0])),
          // Green
          Math.floor(map(transitionPct, 0, 100, currentColorOrLed[1], toColor[1])),
          // Blue
          Math.floor(map(transitionPct, 0, 100, currentColorOrLed[2], toColor[2]))
        )
      }
    }

    // If i pass the whole led array
    if (currentColorOrLed.length === this.ledCount * 3) {
      for (let i = 0; i < this.ledCount; i++) {
        const actualIndex = i * 3

        const frameRed = frame[actualIndex]
        const frameGreen = frame[actualIndex + 1]
        const frameBlue = frame[actualIndex + 2]

        if (watchOnlyColored && frameRed === 0 && frameGreen === 0 && frameBlue === 0) {
          continue
        }

        // Red
        frame[actualIndex] = Math.floor(map(transitionPct, 0, 100, frameRed, toColor[0]))
        // Green
        frame[actualIndex + 1] = Math.floor(map(transitionPct, 0, 100, frameGreen, toColor[1]))
        // Blue
        frame[actualIndex + 2] = Math.floor(map(transitionPct, 0, 100, frameBlue, toColor[2]))
      }
    }

    return frame
  }

  public clearInternals() {
    this.blinkStart = undefined
  }
}
