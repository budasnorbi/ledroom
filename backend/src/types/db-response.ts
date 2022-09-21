import { Effect } from "../entities/Effect.entity"
import { Song } from "../entities/Song.entity"
import { Region } from "../entities/Region.entity"

interface RegionWithRelation extends Omit<Region, "song" | "effects"> {
  effects: Omit<Effect, "region">[]
}

export interface SongsWithRelation extends Omit<Song, "path" | "selected" | "regions"> {
  regions: RegionWithRelation[]
}
