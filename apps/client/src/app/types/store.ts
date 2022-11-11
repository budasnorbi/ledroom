import type { GetSongsResponse, UploadSongResponse, DBRegion, DBSong } from "@ledroom2/types"
import type { Region } from "wavesurfer.js/src/plugin/regions"
import type { ClientStepEffect } from "../types/effect"

export type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never

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
  selectedSongId: null | number
  addSongs: (data: GetSongsResponse) => void
  addSong: (data: UploadSongResponse) => void
  removeSong: (id: number) => void
  selectSong: (id: number | null) => void
  updateSongBeatConfig: (bpm: number, beatOffset: number, beatAroundEnd: number) => void
  updateLastTimePosition: (time: number) => void
  updateSongVolume: (volume: number) => void
}

export interface EffectSlice {
  effects: ClientStepEffect[]
  updateStepEffect: (partialStep: Partial<ClientStepEffect>) => void
  selectOrAddEffect: (type: "" | "step") => void
  removeSelectedEffect: () => void
}

export interface RegionsSlice {
  regions: DBRegion[]
  addRegion: AddRegion
  selectRegion: SelectRegion
  removeSelectedRegion: (waveSurfer: WaveSurfer) => void
  updateRegionTime: UpdateRegionTime
}

export type Store = SongsSlice & WavesurferSlice & EffectSlice & RegionsSlice
