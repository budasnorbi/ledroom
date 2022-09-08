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

export interface Step {
  type: "step"
  ledColors: number[]
  barColor?: [number, number, number]
  clipLed: [number, number, number]
  speed: number
  barCount: number
  direction: "left" | "right"
  range: [number, number]
}

export interface EffectRegion {
  id: number
  startTime: number
  endTime: number
  effects: Blink | Step[]
}

type Effects = "blink" | "step"

type Song = {
  beatOffset: number
  beatAroundEnd: number
  bpm: number
  id: number
  name: string
  regions: EffectRegion[]
  selectedRegionId: number
  duration: number
}

export interface Store {
  wavesurferReady: boolean | any
  wavesurferIsPlaying: boolean | any
  songs: Song[]
  selectedSongId: number
  setDuration: (duration: number) => void
  setWavesurferReady: (ready: boolean, wavesurferRef: MutableRefObject<WaveSurfer | null>) => void
  toggleWavesurferIsPlaying: () => void
  fetchSongs: () => Promise<void>
  addSong: (songs: Exclude<Song, "selectedRegionId" | "regions">) => void
  createRegion: (config: Pick<Region, "id" | "startTime" | "endTime">) => void
  updateRegionTime: (options: Partial<Pick<Region, "endTime" | "startTime">>) => void
  selectRegion: (id: number) => void
  addEffectToRegion: (effectName: Effects) => void
  setEffectDuration: (type: "blink", duration: number) => void
  setEffectRange: (type: Effects, range: [number, number]) => void
  removeSong: (id: number) => void
  updateSelectedSongId: (id: number) => any
  updateSongBeatConfig: (
    bpm: number,
    beatOffset: number,
    beatAroundEnd: number,
    wavesurferRef: MutableRefObject<WaveSurfer | null>
  ) => any
}
