import type { Region } from "../entities/Region.entity"
import type { Song } from "../entities/Song.entity"

export interface GetSongsData {
  songs: Omit<Song, "path">[]
  regions: Region[]
  effects: any[]
  selectedSongId: number
}

export type UploadSongResponse = Pick<Songs, "id" | "name" | "bpm" | "beatOffset" | "beatAroundEnd">
