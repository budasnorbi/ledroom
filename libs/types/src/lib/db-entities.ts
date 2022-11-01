import type { Region, Song, StepEffect } from "@ledroom2/models"

export type DBSong = Omit<Song, "path" | "regions" | "selected">
export type DBRegion = Omit<Region, "effects" | "song">
export type DBEffect = Omit<StepEffect, "region">
