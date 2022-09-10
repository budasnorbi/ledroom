import { Store, WavesurferSlice } from "@type/store"
import { GetState } from "zustand"

export const wavesurferSlice = (
  setState: (fn: (state: Store) => void, actionName?: string) => void,
  get: GetState<Store>
): WavesurferSlice => ({
  wavesurferReady: false,
  wavesurferIsPlaying: false,

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
