import { DBSong, SelectRegiongResponse, PatchRegionResponse } from "@ledroom2/types"
import { PatchRegionSchema } from "@ledroom2/validations"
import { regions } from "@prisma/client"
import { StoreApi } from "zustand"
import * as socket from "../api/socket"
import { api } from "../api/web"
import { Methods } from "../types/api"
import { Store, EffectSlice, RegionsSlice } from "../types/store"
import {
  getRegionById,
  getSelectedRegion,
  getSelectedRegionBySongId,
  getSelectedSongIndex,
  getSongById,
  getSongIndexById,
  unSelectRegionBySongId
} from "../utils/storeUtils"

export const regionsInitialState = {
  regions: []
}

export const regionsSlice = (
  set: (fn: (state: Store) => void, actionName?: string) => void,
  get: StoreApi<Store>["getState"]
): RegionsSlice => ({
  ...regionsInitialState,
  async addRegion(newRegion) {
    set((state) => {
      const song = getSongById(state, newRegion.id)

      if (!song) {
        return
      }

      unSelectRegionBySongId(state, song.id)

      state.regions.push(newRegion)
    }, "addRegion")
  },

  async selectRegion(selectedRegion, wavesurfer) {
    const { selectedSongId } = get()
    if (selectedSongId === null) {
      return
    }

    /*const response = await api<PatchRegionResponse, Partial<PatchRegionSchema>>(
      `/region/${selectedRegion.id}`,
      {
        method: Methods.PATCH,
        body: {
          songId: selectedSongId
        }
      }
    )

    if (response.statusCode !== 204) {
      return
    }*/

    for (const key in wavesurfer.regions.list) {
      const _region = wavesurfer.regions.list[key]
      if (_region.element.getAttribute("data-rangetype") === "effect-range") {
        _region.update({
          color: "rgba(0, 0, 255, 0.15)"
        })
      }
    }

    selectedRegion.update({
      color: "rgba(255, 0, 0, 0.15)"
    })

    set((state) => {
      const song = state.songs.find((song) => song.id === state.selectedSongId)

      if (!song) {
        return
      }

      for (let i = 0; i < state.regions.length; i++) {
        const region = state.regions[i]
      }

      const region = state.regions.find((region) => region.id === selectedRegion.id)

      if (region) {
        region.selected = true
      }
    }, "selectRegion")
  },

  async removeSelectedRegion(wavesurferRef) {
    const state = get()

    if (state.selectedSongId === null) {
      return
    }

    const songIndex = getSelectedSongIndex(state)

    if (songIndex === -1) {
      return
    }

    /* const response = await api(`/region/${songs[songIndex].selectedRegionId}`, {
      method: Methods.DELETE
    })

    if (response.statusCode !== 204) {
      return
    } */

    socket.renderEffectChanges()
    set((state) => {
      const selectedRegion = getSelectedRegion(state)

      if (!selectedRegion) {
        return
      }

      wavesurferRef.regions.list[selectedRegion.id].remove()

      state.regions = state.regions.filter(
        (region) => region.songId === state.songs[songIndex].id && !region.selected
      )
    }, "removeRegion")
  },

  async updateRegionTime(targetedRegion) {
    const { selectedSongId, songs, regions } = get()
    const songIndex = songs.findIndex((song) => song.id === selectedSongId)

    if (songIndex === -1) {
      return
    }

    const regionIndex = regions.findIndex((region) => region.id === targetedRegion.id)

    if (regionIndex === -1) {
      return
    }

    set((state) => {
      state.regions[regionIndex].startTime =
        targetedRegion.startTime ?? state.regions[regionIndex].startTime
      state.regions[regionIndex].endTime =
        targetedRegion.endTime ?? state.regions[regionIndex].endTime
    }, "updateRegionTime")
  }
})
