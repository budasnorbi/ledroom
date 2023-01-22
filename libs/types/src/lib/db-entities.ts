import type { song, region, step_effect } from "@prisma/client"
import type { RGBColor } from "react-color"

export type StepEffects = Omit<step_effect, "barColor" | "clipColor"> & {
  barColor: RGBColor
  clipColor: RGBColor
}

export type DBSong = Omit<song, "path" | "selected">
export type DBRegion = region
export type DBEffect = step_effect

export type RegionWithRelation = region & {
  step_effects: StepEffects 
}

export type SongsWithRelation = (song & {
  regions: (region & {
    step_effects: step_effect 
  })[]
})[]

export type StepEffectsWithRelations = step_effect 
