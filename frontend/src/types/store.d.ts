export type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never

type StateFromFunctions<T extends [...any]> = T extends [infer F, ...infer R]
  ? F extends (...args: any) => object
    ? StateFromFunctions<R> & ReturnType<F>
    : unknown
  : unknown

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
  id: string
  startTime: number
  endTime: number
  //effects: Blink | Step[]
}

type Effects = "blink" | "step"

interface Song {
  beatOffset: number
  beatAroundEnd: number
  bpm: number
  id: number
  name: string
  regions: EffectRegion[]
  selectedRegionId: string
  lastTimePosition: number
  volume: number
}

interface DbSong extends Exclude<Song, "regions"> {}

export interface WavesurferSlice {
  wavesurferReady: boolean
  wavesurferIsPlaying: boolean
  updateWavesurferReady: (isReady: boolean) => void
  toggleWavesurferIsPlaying: () => void
}

export interface SongsSlice {
  selectedSongId: number | null
  songs: Song[]
  addSongs: (data: { songs: Song[]; selectedSongId: number }) => void
  removeSong: (id: number) => void
  selectSong: (id: number | null) => void
  updateSongBeatConfig: (
    bpm: number,
    beatOffset: number,
    beatAroundEnd: number,
    wavesurferRef: WaveSurfer
  ) => void
  addRegion: (config: EffectRegion) => void
  selectRegion: (id: string) => void
  removeRegion: () => void
  updateRegionTime: (options: { startTime?: number; endTime?: number; id: string }) => void
  updateLastTimePosition: (time: number) => void
  updateSongVolume: (volume: number) => void
}

export type Store = SongsSlice & WavesurferSlice
