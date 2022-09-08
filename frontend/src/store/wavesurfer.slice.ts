import { Store, WavesurferSlice } from "@type/store"
import { renderBeatRegions } from "@utils/renderBeatRegions"
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

  toggleWavesurferReady(wavesurferRef) {
    setState((state) => {
      state.wavesurferReady = !state.wavesurferReady
    }, "toggleWavesurferReady")

    const { songs, selectedSongId, addRegion, selectRegion, updateRegionTime } = get()

    for (const song of songs) {
      if (song.id === selectedSongId) {
        renderBeatRegions(
          wavesurferRef,
          {
            bpm: song.bpm,
            beatOffset: song.beatOffset,
            beatAroundEnd: song.beatAroundEnd
          },
          {
            addRegion,
            selectRegion,
            updateRegionTime
          }
        )
      }
    }
  }
})
