import create, { GetState, State, StoreApi, UseBoundStore } from "zustand"
import produce from "immer"
import { devtools } from "zustand/middleware"

import { Store, WithSelectors } from "@type/store"
import { songSlice } from "./songs.slice"
import { wavesurferSlice } from "./wavesurfer.slice"

const createSelectors = <S extends UseBoundStore<StoreApi<State>>>(_store: S) => {
  let store = _store as WithSelectors<typeof _store>
  store.use = {}
  for (let k of Object.keys(store.getState())) {
    ;(store.use as any)[k] = () => store((s) => s[k as keyof typeof s])
  }

  return store
}

export const useStore = createSelectors(
  create<Store>()(
    devtools((set, get) => {
      const setState = (fn: (state: Store) => void, actionName?: string) => {
        return set(produce(get(), fn), false, actionName)
      }

      return {
        ...wavesurferSlice(setState, get),
        ...songSlice(setState, get)
      }
    })
  )
)
