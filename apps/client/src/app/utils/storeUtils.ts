import { DBSong } from "@ledroom2/types"
import { regions, songs, step_effects } from "@prisma/client"
import { Store } from "../types/store"

// SONG queries
export const getSongById = (state: Store, id: songs["id"]) => {
  return state.songs.find((song) => song.id === id)
}

export const getSongIndexById = (state: Store, id: songs["id"]) => {
  return state.songs.findIndex((song) => song.id === id)
}

export const getSelectedSongIndex = (state: Store) => {
  return state.songs.findIndex((song) => song.id === state.selectedSongId)
}

// REGION queries
export const getRegionById = (state: Store, id: regions["id"]) => {
  return state.regions.find((region) => region.id === id)
}

export const getSelectedRegion = (state: Store) => {
  return state.regions.find((region) => region.id === state.selectedSongId && region.selected)
}

export const getSelectedRegionBySongId = (state: Store, songId: regions["songId"]) => {
  return state.regions.find((region) => region.id === songId && region.selected)
}

export const getSelectedRegionIndexBySongId = (state: Store, songId: regions["songId"]) => {
  return state.regions.findIndex((region) => region.id === songId && region.selected)
}

export const unSelectRegionBySongId = (state: Store, songId: regions["songId"]) => {
  for (let i = 0; i < state.regions.length; i++) {
    const region = state.regions[i]
    if (region.songId === songId && region.selected) {
      region.selected = false
      return
    }
  }
}

// EFFECT queries
export const getStepEffect = (state: Store) => {
  if (!state.selectedSongId) {
    return null
  }

  const region = getSelectedRegionBySongId(state, state.selectedSongId)

  if (!region) {
    return null
  }

  const stepEffect = state.effects.find(
    (effect) => effect.type === "step" && effect.regionId === region.id
  )

  return stepEffect ?? null
}

export const getStepEffectIndex = (state: Store) => {
  if (!state.selectedSongId) {
    return -1
  }

  const region = getSelectedRegionBySongId(state, state.selectedSongId)

  if (!region) {
    return -1
  }

  const stepEffectIndex = state.effects.findIndex(
    (effect) => effect.type === "step" && effect.regionId === region.id
  )

  return stepEffectIndex
}
