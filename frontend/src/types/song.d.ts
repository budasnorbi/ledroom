import type { DBRegions } from "@backend/RegionsRepository"
import type { ClientSong } from "@backend/SongsRepository"

export interface InitialSongState {
  songs: Song[]
  regions: DBRegions[]
  selectedSongId: null | number
}
