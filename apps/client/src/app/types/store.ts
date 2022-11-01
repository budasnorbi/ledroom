import type {
  GetSongsResponse,
  UploadSongResponse,
  DBEffect,
  DBRegion,
  DBSong
} from "@ledroom2/types"
import type { Region } from "wavesurfer.js/src/plugin/regions"

export type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never

// type StateFromFunctions<T extends [...any]> = T extends [infer F, ...infer R]
//   ? F extends (...args: any) => object
//     ? StateFromFunctions<R> & ReturnType<F>
//     : unknown
//   : unknown

export interface WavesurferSlice {
  wavesurferReady: boolean
  wavesurferIsPlaying: boolean
  updateWavesurferReady: (isReady: boolean) => void
  toggleWavesurferIsPlaying: () => void
}

export type AddRegion = (config: DBRegion) => void
export type UpdateRegionTime = (options: { startTime: number; endTime: number; id: string }) => void
export type SelectRegion = (selectedRegion: Region, wavesurfer: WaveSurfer) => void

export interface SongsSlice {
  songs: DBSong[]
  regions: DBRegion[]
  effects: DBEffect[]
  selectedSongId: null | number
  addSongs: (data: GetSongsResponse) => void
  addSong: (data: UploadSongResponse) => void
  removeSong: (id: number) => void
  selectSong: (id: number | null) => void
  updateSongBeatConfig: (bpm: number, beatOffset: number, beatAroundEnd: number) => void
  addRegion: AddRegion
  selectRegion: SelectRegion
  removeSelectedRegion: (waveSurfer: WaveSurfer) => void
  updateRegionTime: UpdateRegionTime
  updateLastTimePosition: (time: number) => void
  updateSongVolume: (volume: number) => void
  addStepEffect: () => void
}

export type Store = SongsSlice & WavesurferSlice
