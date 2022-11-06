import type { Region, Song } from "@ledroom2/models";
import type { StepEffectSchema } from "@ledroom2/validations";

export type DBSong = Omit<Song, "path" | "regions" | "selected">;
export type DBRegion = Omit<Region, "song" | "stepEffect" | "stepEffectId">;
export type DBEffect = StepEffectSchema;
