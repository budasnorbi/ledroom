import { Store, Region } from "@type/store"
import { updateRegions } from "./socket"

import create from "zustand"
import { devtools } from "zustand/middleware"

const initialState = {
  wavesurferPlayPause: false,
  wavesurferReady: false,
  duration: 0,
  beatOffset: 0.15054,
  beatEndTime: 195.5,
  beatInterval: 1 / (127 / 60),
  regions: [],
  selectedRegion: -1
}

export const useStore = create<Store>()(
  devtools((set) => ({
    ...initialState,
    resetStore() {
      set(() => initialState)
    },
    setDuration(duration) {
      set(() => ({ duration }), false, "setDuration")
    },
    setWavesurferPlayPause() {
      set(
        (state) => ({
          wavesurferPlayPause: !state.wavesurferPlayPause
        }),
        false,
        "setWavesurferPlayPause"
      )
    },
    setWavesurferReady(ready) {
      set(
        () => ({
          wavesurferReady: ready
        }),
        false,
        "setWavesurferReady"
      )
    },
    createRegion(region: Region) {
      set(
        (state) => {
          const newRegions = [...state.regions, region]
          updateRegions(newRegions)
          return {
            regions: newRegions
          }
        },
        false,
        "createRegion"
      )
    },
    updateRegion(options) {
      set(
        (state) => {
          const selectedRegionIndex = state.regions.findIndex(
            (region) => region.id === state.selectedRegion
          )
          const modifiedRegion = { ...state.regions[selectedRegionIndex] }

          if (selectedRegionIndex !== -1) {
            for (const key in options) {
              /* @ts-ignore */
              modifiedRegion[key] = options[key]
            }
          }

          state.regions[selectedRegionIndex] = modifiedRegion
          updateRegions(state.regions)
          return {
            regions: state.regions
          }
        },
        false,
        "updateRegion"
      )
    },
    selectRegion(id) {
      set(
        (state) => {
          const selectedRegion = state.regions.find((region) => region.id === id)

          return {
            selectedRegion: selectedRegion?.id ?? state.selectedRegion
          }
        },
        false,
        "selectRegion"
      )
    }
  }))
)
