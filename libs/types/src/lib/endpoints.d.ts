import { DBSong, SongsWithRelation } from "./db-entities"
import type { songs, regions, step_effects, effect_ranges } from "@prisma/client"
import { type } from "os"

export type UploadSongResponse = DBSong

export type GetSongsResponse = SongsWithRelation

export type DeleteSongResponse = void
export type PatchRegionResponse = void
export type PatchSongResponse = void
export type AddRegionResponse = { id: regions["id"] }
export type DeleteRegionResponse = void
export type SelectRegiongResponse = void
export type AddStepEffect = { id: step_effects["id"] }
export type DeleteStepEffect = void
