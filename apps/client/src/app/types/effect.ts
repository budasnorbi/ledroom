import { StepEffect } from "@ledroom2/models"

export interface Blink {
  type: "blink"
  bezierPoints: [number, number, number, number]
  ledColors: number[]
  fromColor?: [number, number, number]
  toColor: number[]
  watchOnlyColored?: boolean
  duration: number
  range: [number, number]
}

export interface ClientStepEffect extends Omit<StepEffect, "region"> {
  type: "step"
}
