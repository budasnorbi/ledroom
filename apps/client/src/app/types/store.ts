import type { GetSongsResponse, UploadSongResponse, DBRegion, DBSong } from "@ledroom2/types"
import type { Region } from "wavesurfer.js/src/plugin/regions"
import type { effect_ranges, songs } from "@prisma/client"
import type { StepEffects } from "@ledroom2/types"

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
  selectedSongId: songs["id"] | null
  addSongs: (data: GetSongsResponse) => void
  addSong: (data: UploadSongResponse) => void
  removeSong: (id: songs["id"]) => void
  selectSong: (id: songs["id"] | null) => void
  updateSongBeatConfig: (
    bpm: songs["bpm"],
    beatOffset: songs["beatOffset"],
    beatAroundEnd: songs["beatAroundEnd"]
  ) => void
  updateLastTimePosition: (time: songs["lastTimePosition"]) => void
  updateSongVolume: (volume: songs["volume"]) => void
}

export interface EffectSlice {
  effects: StepEffects[]
  updateStepEffect: (partialStep: Partial<StepEffects>) => void
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

export interface RangesSlice {
  ranges: effect_ranges[]
}

export type Store = SongsSlice & WavesurferSlice & EffectSlice & RegionsSlice
