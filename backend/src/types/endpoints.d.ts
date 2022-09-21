import { SongsWithRelation } from "./db-response"
import { DBSong } from "./db-entities"

export type UploadSongResponse = DBSong

export interface GetSongsResponse {
  songs: SongsWithRelation[]
  selectedRegionId: number | null
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DeleteSongResponse {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SelectSongResponse {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BeatConfigResponse {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SelectRegiongResponse {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UpdateRegiongResponse {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UpdateLastTimePositionResponse {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UpdateVolumeResponse {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AddRegionResponse {}
