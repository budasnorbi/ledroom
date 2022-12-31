import { StoreApi } from "zustand"
import type { Store, RangesSlice } from "../types/store"

export const rangesInitialSlice = {
  ranges: []
}

export const rangesSlice = (
  set: (fn: (state: Store) => void, actionName?: string) => void,
  get: StoreApi<Store>["getState"]
): RangesSlice => ({
  ...rangesInitialSlice
})
