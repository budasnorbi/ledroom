import { Song, Region } from "@ledroom2/models";
import { StepEffectSchema } from "@ledroom2/validations";

interface RegionWithRelation extends Omit<Region, "song"> {}

export interface SongsWithRelation
  extends Omit<Song, "path" | "selected" | "regions"> {
  regions: RegionWithRelation[];
}
