import { Song, Region } from "@ledroom2/models";

interface RegionWithRelation extends Omit<Region, "song"> {}

export interface SongsWithRelation
  extends Omit<Song, "path" | "selected" | "regions"> {
  regions: RegionWithRelation[];
}