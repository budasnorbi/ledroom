import type { Song } from "../entities/Song.entity"
import type { Region } from "../entities/Region.entity"
import type { Effect } from "../entities/Effect.entity"

export type DBSong = Omit<Song, "path" | "regions" | "selected">
export type DBRegion = Omit<Region, "effects" | "song">
export type DBEffect = Omit<Effect, "region">
