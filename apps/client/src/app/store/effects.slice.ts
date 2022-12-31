import { AddStepEffect, DBRegion, DBSong, PatchRegionResponse } from "@ledroom2/types"
import { PatchRegionSchema, PatchStepEffectSchema, StepEffectSchema } from "@ledroom2/validations"
import { StoreApi } from "zustand"
import { api } from "../api/web"
import { Methods } from "../types/api"
import { Store, EffectSlice } from "../types/store"
import * as socket from "../api/socket"
import { step_effects } from "@prisma/client"
import { getSongIndexById, getStepEffect, getStepEffectIndex } from "../utils/storeUtils"

export const effectInitialState = {
  effects: []
}

export const effectSlice = (
  set: (fn: (state: Store) => void, actionName?: string) => void,
  get: StoreApi<Store>["getState"]
): EffectSlice => ({
  ...effectInitialState,
  async updateStepEffect(partialStep) {
    const store = get()

    if (!store.selectedSongId) {
      return
    }

    const songIndex = getSongIndexById(store, store.selectedSongId)

    if (songIndex === -1) {
      return
    }

    const effectIndex = getStepEffectIndex(store)

    if (effectIndex === -1) {
      return
    }
    /* 
    const response = await api<void, Partial<step_effects>>(
      `/effect/step/${effects[effectIndex].id}`,
      {
        method: Methods.PATCH,
        body: partialStep
      }
    )

    if (response.statusCode !== 204) {
      return
    }
 */
    socket.renderEffectChanges()
    /*  set((state) => {
      const effect = state.effects[effectIndex]

      ;(Object.keys(partialStep) as Array<keyof typeof partialStep>).forEach((key) => {
        effect[key] = partialStep[key]
      })
    }) */
  },

  async selectOrAddEffect(type) {
    /* const { selectedSongId, songs, effects, regions } = get()

    const songIndex = songs.findIndex((song) => song.id === selectedSongId)

    if (songIndex === -1) {
      return
    }

    const regionIndex = regions.findIndex(
      (region) => region.id === songs[songIndex].selectedRegionId
    )

    if (regionIndex === -1) {
      return
    }

    if (type === "") {
      const response = await api<PatchRegionResponse, Partial<PatchRegionSchema>>(
        `/region/${songs[songIndex].selectedRegionId}`,
        {
          method: Methods.PATCH,
          body: {
            selectedEffect: null
          }
        }
      )

      if (response.statusCode !== 204) {
        return
      }

      socket.renderEffectChanges()
      set((state) => {
        state.regions[regionIndex].selectedEffect = null
      })
    } else {
      // need to check if the effect already exsist by its type
      const effect = effects.find(
        (effect) => songs[songIndex].selectedRegionId === effect.regionId && effect.type === type
      )

      if (effect) {
        const response = await api<void, PatchStepEffectSchema>(`/effect/${effect.id}`, {
          method: Methods.PATCH,
          body: {
            selected: true
          }
        })

        if (response.statusCode !== 204) {
          return
        }

        socket.renderEffectChanges()
        set((state) => {
          state.regions[regionIndex].selectedEffect = effect.id
        })
      } else {
        const initialStep: StepEffectSchema = {
          regionId: songs[songIndex].selectedRegionId as string,
          barColor: { r: 0, g: 0, b: 255, a: 1 },
          clipColor: { r: 0, g: 0, b: 0, a: 1 },
          speed: 1,
          barCount: 50,
          direction: "left"
        }

        const effectCreateResponse = await api<AddStepEffect, StepEffectSchema>("/effect/step", {
          method: Methods.POST,
          body: initialStep
        })

        if (effectCreateResponse.statusCode !== 201) {
          return
        }

        const regionEffectSelectionResponse = await api<
          PatchRegionResponse,
          Partial<PatchRegionSchema>
        >(`/region/${songs[songIndex].selectedRegionId}`, {
          method: Methods.PATCH,
          body: {
            selectedEffect: effectCreateResponse.data.id
          }
        })

        if (regionEffectSelectionResponse.statusCode !== 204) {
          return
        }

        socket.renderEffectChanges()
        set((state) => {
          state.effects.push({
            ...initialStep,
            type: "step",
            id: effectCreateResponse.data.id
          })

          for (const region of state.regions) {
            if (region.id === state.songs[songIndex].selectedRegionId) {
              region.selectedEffect = effectCreateResponse.data.id
            }
          }
        }, "addStepEffect")
      }
    } */
  },
  async removeSelectedEffect() {
    /* const { selectedSongId, songs, regions, effects } = get()

    const songIndex = songs.findIndex((song) => song.id === selectedSongId)

    if (songIndex === -1) {
      return
    }

    const regionIndex = regions.findIndex(
      (region) => region.id === songs[songIndex].selectedRegionId
    )

    if (regionIndex === -1) {
      return
    }

    const effectIndex = effects.findIndex(
      (effect) => effect.id === regions[regionIndex].selectedEffect
    )

    if (effectIndex === -1) {
      return
    }

    const response = await api(`/effect/step/${effects[effectIndex].id}`, {
      method: Methods.DELETE
    })

    if (response.statusCode !== 204) {
      return
    }

    socket.renderEffectChanges()
    set((state) => {
      state.effects = state.effects.filter((effect) => effect.id !== state.effects[effectIndex].id)

      state.regions[regionIndex].selectedEffect = null
    }) */
  }
})
