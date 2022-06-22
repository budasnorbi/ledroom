export interface Blink {
  type: "blink"
  bezierPoints: [number, number, number, number]
  ledColors: number[]
  fromColor?: [number, number, number]
  toColor: number[]
  watchOnlyColored?: boolean
  duration: number
  range?: [number, number]
}

export interface Step {
  type: "step"
  ledColors: number[]
  barColor?: [number, number, number]
  clipLed: [number, number, number]
  speed: number
  barCount: number
  direction: "left" | "right"
  range?: [number, number]
}

export interface EffectRegion {
  id: number
  startTime: number
  endTime: number
  effects: (Step | Blink)[]
}

type Effects = "blink" | "step"

export interface Store {
  bpmRegionsIsCalculated: boolean
  wavesurferReady: boolean
  wavesurferIsPlaying: boolean
  regions: Region[]
  bpm: number
  beatEndTime: number
  beatOffset: number
  duration: number
  selectedRegion: number
  setDuration: (duration: number) => void
  setWavesurferReady: (ready: boolean) => void
  toggleWavesurferIsPlaying: () => void
  createRegion: (config: Pick<Region, "id" | "startTime" | "endTime">) => void
  updateRegionTime: (options: Partial<Pick<Region, "endTime" | "startTime">>) => void
  selectRegion: (id: number) => void
  addEffectToRegion: (effectName: Effects) => void
  setBPM: (bpm: number) => void
  setBeatOffset: (beatOffset: number) => void
  setBeatEndTime: (time: number) => void
}
