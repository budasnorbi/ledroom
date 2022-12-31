import type { songs, regions, step_effects, effect_ranges } from "@prisma/client"
import type { RGBColor } from "react-color"

export type StepEffects = Omit<step_effects, "barColor" | "clipColor"> & {
  barColor: RGBColor
  clipColor: RGBColor
}

export type DBSong = Omit<songs, "path" | "selected">
export type DBRegion = regions
export type DBEffect = step_effects

export type RegionWithRelation = regions & {
  step_effects: StepEffects & { effect_ranges: effect_ranges[] }
}

export type SongsWithRelation = (songs & {
  regions: (regions & {
    step_effects: step_effects & {
      effect_ranges: effect_ranges[]
    }
  })[]
})[]

export interface StepEffectsWithRelations extends step_effects {
  ranges: effect_ranges[]
}
