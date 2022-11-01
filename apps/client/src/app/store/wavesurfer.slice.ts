import { Store, WavesurferSlice } from "../types/store"
import { StoreApi } from "zustand"

export const wavesurferIntialState = {
  wavesurferReady: false,
  wavesurferIsPlaying: false
}

export const wavesurferSlice = (
  setState: (fn: (state: Store) => void, actionName?: string) => void,
  get: StoreApi<Store>["getState"]
): WavesurferSlice => ({
  ...wavesurferIntialState,

  toggleWavesurferIsPlaying() {
    setState((state) => {
      state.wavesurferIsPlaying = !state.wavesurferIsPlaying
    }, "toggleWavesurferIsPlaying")
  },

  updateWavesurferReady(isReady) {
    setState((state) => {
      state.wavesurferReady = isReady
    }, "updateWavesurferReady")
  }
})
