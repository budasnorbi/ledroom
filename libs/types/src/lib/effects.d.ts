export interface Blink {
  bezierPoints: [number, number, number, number]
  ledColors: number[]
  fromColor?: [number, number, number]
  toColor: number[]
  watchOnlyColored?: boolean
  duration: number
  range?: [number, number]
}

export interface Step {
  ledColors: number[]
  barColor?: [number, number, number]
  clipLed: [number, number, number]
  speed: number
  barCount: number
  direction: "left" | "right"
  range?: [number, number]
}
