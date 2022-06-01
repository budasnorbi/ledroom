export interface Blink {
  yGenerator?: (mappedX: number) => number
  ledColor: number[]
  fromColor?: [number, number, number]
  toColor: number[]
  watchOnlyColored?: boolean
  duration: number
  range?: [number, number]
}

export interface Step {
  ledColor: number[]
  barColor?: [number, number, number]
  clipLed: [number, number, number]
  speed: number
  barCount: number
  direction: "left" | "right"
  range?: [number, number]
}
