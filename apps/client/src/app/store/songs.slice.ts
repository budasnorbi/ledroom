import { StoreApi } from "zustand"
import type { Store, SongsSlice } from "../types/store"

import { api } from "../api/web"

import { DBSong, PatchSongResponse } from "@ledroom2/types"
import type { OptionalSongSchema } from "@ledroom2/validations"
import { Methods } from "../types/api"

export const songInitialState = {
  songs: [],
  regions: [],
  effects: [],
  selectedSongId: null
}

export const songSlice = (
  set: (fn: (state: Store) => void, actionName?: string) => void,
  get: StoreApi<Store>["getState"]
): SongsSlice => ({
  ...songInitialState,

  addSong(data) {
    const { updateWavesurferReady, wavesurferReady, selectSong } = get()

    if (wavesurferReady) {
      updateWavesurferReady(false)
    }

    set((state) => {
      state.songs.push(data)
    }, "addSong")

    selectSong(data.id)
  },

  addSongs({ songs, selectedRegionId }) {
    set((state) => {
      for (let i = 0; i < songs.length; i++) {
        const { regions: _regions, ...song } = songs[i]
        state.songs.push(song)
        for (let k = 0; k < _regions.length; k++) {
          const { stepEffect, ...region } = _regions[k]
          state.regions.push(region)
          if (stepEffect) {
            state.effects.push({ ...stepEffect, type: "step" })
          }
        }
      }

      state.selectedSongId = selectedRegionId
    }, "addSongs")
  },

  async removeSong(songId) {
    const response = await api(`/song/${songId}`, {
      method: Methods.DELETE
    })

    if (response.statusCode !== 204) {
      return
    }

    set((state) => {
      state.wavesurferIsPlaying = false

      const songRegionIds = state.regions
        .filter((region) => region.songId === songId)
        .map((region) => region.id)

      // Clearing effects
      state.effects = state.effects.filter(
        (effect) => songRegionIds.includes(effect.regionId) === false
      )

      // Clearing regions
      state.regions = state.regions.filter((region) => region.songId !== songId)

      // Clearing song
      state.songs = state.songs.filter((song) => song.id !== songId)

      const selectedSongId =
        state.songs.find((song, index, array) => index === array.length - 1)?.id ?? null

      state.selectedSongId = selectedSongId
    }, "removeSong")
  },

  async selectSong(id) {
    const response = await api<PatchSongResponse, Partial<OptionalSongSchema>>(`/song/${id}`, {
      method: Methods.PATCH,
      body: {
        selected: true
      }
    })

    if (response.statusCode !== 204) {
      return
    }

    set((state) => {
      state.wavesurferReady = false
      state.selectedSongId = id
    }, "selectSong")
  },

  updateSongBeatConfig(bpm, beatOffset, beatAroundEnd) {
    set((state) => {
      const song = state.songs.find((song) => song.id === state.selectedSongId) as DBSong

      song.bpm = bpm
      song.beatOffset = beatOffset
      song.beatAroundEnd = beatAroundEnd

      const removedRegions = state.regions
        .filter((region) => region.songId === song.id)
        .map((region) => region.id)

      // Clear regions
      state.regions = state.regions.filter((region) => region.songId !== song.id)

      // Clear effects
      state.effects = state.effects.filter(
        (effect) => removedRegions.includes(effect.regionId) === false
      )
    }, "updateSongBeatsConfig")
  },

  async updateLastTimePosition(time) {
    const { selectedSongId, songs } = get()

    const songIndex = songs.findIndex((song) => song.id === selectedSongId)

    if (songIndex === -1 || songs[songIndex].lastTimePosition === time) {
      return
    }

    const response = await api<PatchSongResponse, Partial<OptionalSongSchema>>(
      `/song/${selectedSongId}`,
      {
        method: Methods.PATCH,
        body: {
          lastTimePosition: time
        }
      }
    )

    if (response.statusCode !== 204) {
      return
    }

    set((state) => {
      state.songs[songIndex].lastTimePosition = time
    }, "updateLastTimePosition")
  },

  async updateSongVolume(volume) {
    const { selectedSongId, songs } = get()

    const songIndex = songs.findIndex((song) => song.id === selectedSongId)

    if (songIndex === -1) {
      return
    }

    const response = await api<PatchSongResponse, Partial<OptionalSongSchema>>(
      `/song/${songs[songIndex].id}`,
      {
        method: Methods.PATCH,
        body: { volume }
      }
    )

    if (response.statusCode !== 204) {
      return
    }

    set((state) => {
      state.songs[songIndex].volume = volume
    }, "updateSongVolume")
  }
})
