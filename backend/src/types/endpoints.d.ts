import { SongsWithRelation } from "./db-response"
import { DBSong } from "./db-entities"

export type UploadSongResponse = DBSong

export interface GetSongsResponse {
  songs: SongsWithRelation[]
  selectedRegionId: number | null
}

export type DeleteSongResponse = void
export type SelectSongResponse = void
export type BeatConfigResponse = void
export type SelectRegiongResponse = void
export type UpdateRegiongResponse = void
export type UpdateLastTimePositionResponse = void
export type UpdateVolumeResponse = void
export type AddRegionResponse = void
export type DeleteRegionResponse = void
