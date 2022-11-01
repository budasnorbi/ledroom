import { Song, Region, StepEffect } from "@ledroom2/models"

interface RegionWithRelation extends Omit<Region, "song" | "effects"> {
  effects: Omit<StepEffect, "region">[]
}

export interface SongsWithRelation extends Omit<Song, "path" | "selected" | "regions"> {
  regions: RegionWithRelation[]
}
