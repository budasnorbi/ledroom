import create, { State, StoreApi, UseBoundStore } from "zustand"
import produce from "immer"
import { devtools } from "zustand/middleware"

import { Store, WithSelectors } from "../types/store"
import { songInitialState, songSlice } from "./songs.slice"
import { wavesurferIntialState, wavesurferSlice } from "./wavesurfer.slice"
import { effectInitialState, effectSlice } from "./effects.slice"
import { regionsInitialState, regionsSlice } from "./regions.slice"

const createSelectors = <S extends UseBoundStore<StoreApi<State>>>(_store: S) => {
  const store = _store as WithSelectors<typeof _store>
  store.use = {}
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  /* @ts-ignore */
  for (const k of Object.keys(store.getState())) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    /* @ts-ignore */
    ;(store.use as any)[k] = () => store((s) => s[k as keyof typeof s])
  }

  return store
}

export const useStore = createSelectors(
  create<Store & { resetStore: () => void }>()(
    devtools((_setState, getState) => {
      const setState = (fn: (state: Store) => void, actionName?: string) => {
        return _setState(produce(getState(), fn), false, actionName)
      }

      return {
        ...wavesurferSlice(setState, getState),
        ...songSlice(setState, getState),
        ...effectSlice(setState, getState),
        ...regionsSlice(setState, getState),
        resetStore() {
          setState(async (state) => {
            state.effects = effectInitialState.effects
            state.regions = regionsInitialState.regions
            state.songs = songInitialState.songs
            state.selectedSongId = songInitialState.selectedSongId
            state.wavesurferIsPlaying = wavesurferIntialState.wavesurferIsPlaying
            state.wavesurferReady = wavesurferIntialState.wavesurferReady
          }, "resetStore")
        }
      }
    })
  )
)
