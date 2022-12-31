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
