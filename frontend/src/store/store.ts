import { Store, EffectRegion, Blink, Step } from "@type/store"
import { updateRegions } from "@utils/socket"
import produce from "immer"

import create from "zustand"
import { devtools } from "zustand/middleware"

export const useStore = create<Store>()(
  devtools((set) => {
    return {
      wavesurferIsPlaying: false,
      wavesurferReady: false,
      duration: 0,
      beatOffset: 0.15,
      beatEndTime: 195.5,
      bpm: 127,
      regions: [],
      selectedRegion: -1,
      songs: [],
      selectedSongId: -1,
      setDuration(duration) {
        set(
          produce((state) => {
            state.duration = duration
          }),
          false,
          "setDuration"
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
      toggleWavesurferIsPlaying() {
        set(
          produce((state: Store) => {
            /* @ts-ignore */
            //state.wavesurferIsPlaying = !state.wavesurferIsPlaying
          }),
          false,
          "toggleWavesurferIsPlaying"
        )
      },
      createRegion(config) {
        const region: EffectRegion = {
          ...config,
          effects: []
        }

        set(
          produce((state: Store) => {
            state.regions.push(region)
          }),
          false,
          "createRegion"
        )
      },
      updateRegionTime(options) {
        set(
          produce((state: Store) => {
            const region = state.regions.find((region) => region.id === state.selectedRegion)

            if (region) {
              region.startTime = options.startTime ?? region.startTime
              region.endTime = options.endTime ?? region.endTime

              updateRegions(state.regions)
            }
          }),
          false,
          "updateRegionTime"
        )
      },
      selectRegion(id: number) {
        set(
          produce((state: Store) => {
            const selectedRegion = state.regions.find((region) => region.id === id)
            if (selectedRegion) {
              state.selectedRegion = selectedRegion.id
            }
          }),
          false,
          "selectRegion"
        )
      },
      addEffectToRegion(effectName) {
        set(
          produce((state: Store) => {
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

            const region = state.regions.find((region) => region.id === state.selectedRegion)

            const effectIsExsists =
              region?.effects.findIndex((effect) => effect.type === effectName) === -1

            if (region && !effectIsExsists) {
              region.effects.push(effect)
            }
          }),
          false,
          "addEffectToRegion"
        )
      },
      setBPM(bpm) {
        set(
          produce((state: Store) => {
            state.bpm = bpm
          }),
          false,
          "setBPM"
        )
      },
      setBeatOffset(beatOffset) {
        set(
          produce((state: Store) => {
            state.beatOffset = beatOffset
          }),
          false,
          "setBeatOffset"
        )
      },
      setBeatEndTime(beatEndTime) {
        set(
          produce((state: Store) => {
            state.beatEndTime = beatEndTime
          }),
          false,
          "setBeatEndTime"
        )
      },
      setEffectDuration(type, duration) {
        set(
          produce((state: Store) => {
            const { regions, selectedRegion } = state

            for (let i = 0; i < regions.length; i++) {
              const region = regions[i]

              if (region.id === selectedRegion) {
                for (let k = 0; k < regions[i].effects.length; k++) {
                  const effect = regions[i].effects[k]

                  if (effect.type === type) {
                    effect.duration = duration
                    break
                  }
                }
                break
              }
            }
          }),
          false,
          "setEffectDuration"
        )
      },
      setEffectRange(type, range) {
        set(
          produce((state: Store) => {
            const { regions, selectedRegion } = state

            for (let i = 0; i < regions.length; i++) {
              const region = regions[i]

              if (region.id === selectedRegion) {
                for (let k = 0; k < regions[i].effects.length; k++) {
                  const effect = regions[i].effects[k]

                  if (effect.type === type) {
                    effect.range = range
                    break
                  }
                }
                break
              }
            }
          }),
          false,
          "setEffectRange"
        )
      },
      addSongs(song) {
        set(
          produce((state: Store) => {
            state.songs.push(...song)
          }),
          false,
          "addSong"
        )
      },
      removeSong(id) {
        set(
          produce((state: Store) => {
            state.songs = state.songs.filter((song) => song.id !== id)

            if (state.songs.length === 0) {
              state.selectedSongId = -1
            } else {
              state.selectedSongId = state.songs[state.songs.length - 1].id
            }
          }),
          false,
          "removeSong"
        )
      },
      updateSelectedSongId(id) {
        set(
          produce((state: Store) => {
            state.selectedSongId = id
          }),
          false,
          "updateSelectedSongId"
        )
      }
    }
  })
)
