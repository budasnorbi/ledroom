import { Store, Region, Blink, Step } from "@type/store"
import { updateRegions } from "./socket"

import create from "zustand"
import { devtools } from "zustand/middleware"

export const useStore = create<Store>()(
  devtools((set) => {
    return {
      /* @ts-ignore */
      wavesurferIsPlaying: false,
      wavesurferReady: false,
      duration: 0,
      beatOffset: 0.15054,
      beatEndTime: 195.5,
      beatInterval: 1 / (127 / 60),
      regions: [],
      selectedRegion: -1,
      setDuration(duration) {
        set(() => ({ duration }), false, "setDuration")
      },
      toggleWavesurferIsPlaying() {
        set(
          (state) => ({
            /* @ts-ignore */
            wavesurferIsPlaying: !state.wavesurferIsPlaying
          }),
          false,
          "toggleWavesurferIsPlaying"
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
      createRegion(config) {
        const region: Region = {
          ...config,
          effects: []
        }

        set(
          (state) => {
            return {
              regions: [...state.regions, region]
            }
          },
          false,
          "createRegion"
        )
      },
      updateRegionTime(options) {
        set(
          (state) => {
            const newRegions = state.regions.map((region) => {
              if (region.id === state.selectedRegion) {
                region.startTime = options.startTime ?? region.startTime
                region.endTime = options.endTime ?? region.endTime
              }
              return { ...region }
            })

            updateRegions(newRegions)

            return {
              regions: newRegions
            }
          },
          false,
          "updateRegionTime"
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
      },
      addEffectToRegion(effectName) {
        set(
          (state) => {
            let effect: Step | Blink
            switch (effectName) {
              case "step": {
                const stepEffect: Step = {
                  type: "step",
                  barCount: 50,
                  clipLed: [0, 0, 0],
                  direction: "left",
                  ledColors: [],
                  speed: 1,
                  range: [0, 826],
                  barColor: [255, 255, 255]
                }
                effect = stepEffect
                break
              }
              case "blink": {
                const blinkEffect: Blink = {
                  type: "blink",
                  bezierPoints: [0, 1, 0, 1],
                  duration: 1,
                  ledColors: [],
                  toColor: [255, 255, 255],
                  fromColor: [0, 0, 0],
                  watchOnlyColored: false,
                  range: [0, 826]
                }
                effect = blinkEffect
                break
              }
            }

            const newRegions = state.regions.map((region) => {
              const effectIsNotExists =
                region.effects.findIndex((effect) => effect.type === effectName) === -1

              if (region.id === state.selectedRegion && effectIsNotExists) {
                region.effects.push(effect)
              }
              return { ...region }
            })

            return {
              regions: newRegions
            }
          },
          false,
          "addEffectToRegion"
        )
      }
    }
  })
)
