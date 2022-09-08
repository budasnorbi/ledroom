import create, { State, StoreApi, UseBoundStore } from "zustand"
import produce from "immer"
import { devtools } from "zustand/middleware"

import { Store, EffectRegion, Blink, Step, Song } from "@type/store"
import { updateRegions } from "@utils/socket"
import { api } from "../api/instance"
import { renderBeatRegions } from "@utils/renderBeatRegions"

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never

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
        wavesurferIsPlaying: false,
        wavesurferReady: false,
        songs: [] as Song[],
        selectedSongId: -1,

        setDuration(duration) {
          set(
            produce((state: Store) => {
              for (const song of state.songs) {
                if (song.id === state.selectedSongId) {
                  song.duration = duration
                  return
                }
              }
            }),
            false,
            "setDuration"
          )
        },

        setWavesurferReady(ready, wavesurferRef) {
          setState((state) => {
            state.wavesurferReady = ready
          }, "setWavesurferReady")

          const { songs, selectedSongId, createRegion, selectRegion, updateRegionTime } = get()

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
                  createRegion,
                  selectRegion,
                  updateRegionTime
                }
              )
            }
          }
        },

        toggleWavesurferIsPlaying() {
          setState((state) => {
            state.wavesurferIsPlaying = !state.wavesurferIsPlaying
          }, "toggleWavesurferIsPlaying")
        },

        async fetchSongs() {
          const songs: Song[] = await api
            .get("/songs")
            .then((res) => res.data)
            .catch((error) => {
              console.log(error)
              return null
            })

          if (songs && songs.length !== 0) {
            setState((state) => {
              const songsWithAdditionalProps = songs.map((song) => ({
                ...song,
                regions: [],
                selectedRegionId: -1,
                duration: 0
              }))

              state.songs.push(...songsWithAdditionalProps)
              state.selectedSongId = songs[0].id
            }, "addSongs")
          }
        },

        addSong(song) {
          setState((state) => {
            const songsWithAdditionalProps = {
              ...song,
              regions: [],
              selectedRegionId: -1,
              duration: 0
            }

            state.songs.push(songsWithAdditionalProps)
            state.selectedSongId === song.id
          }, "addSong")
        },

        removeSong(id) {
          setState((state) => {
            state.songs = state.songs.filter((song) => song.id !== id)

            if (state.songs.length === 0) {
              state.selectedSongId = -1
            } else {
              state.selectedSongId = state.songs[state.songs.length - 1].id
            }
          }, "removeSong")
        },

        updateSelectedSongId(id) {
          setState((state) => {
            state.selectedSongId = id
          }, "updateSelectedSongId")
        },

        updateSongBeatConfig(bpm, beatOffset, beatAroundEnd, wavesurferRef) {
          api
            .put("/beat-config", {
              id: get().selectedSongId,
              bpm: bpm,
              beatOffset: beatOffset,
              beatAroundEnd: beatAroundEnd
            })
            .then(() => {
              setState((state) => {
                for (const song of state.songs) {
                  if (song.id === state.selectedSongId) {
                    song.bpm = bpm
                    song.beatOffset = beatOffset
                    song.beatAroundEnd = beatAroundEnd

                    return
                  }
                }
              }, "updateSongBeatsConfig")

              const { createRegion, selectRegion, updateRegionTime } = get()

              renderBeatRegions(
                wavesurferRef,
                {
                  bpm,
                  beatOffset,
                  beatAroundEnd
                },
                {
                  createRegion,
                  selectRegion,
                  updateRegionTime
                }
              )
            })
        },

        createRegion(config) {
          const region: EffectRegion = {
            ...config,
            effects: []
          }

          setState((state) => {
            for (const song of state.songs) {
              if (song.id === state.selectedSongId) {
                song.regions.push(region)
                return
              }
            }
          }, "createRegion")
        },

        updateRegionTime(options) {
          setState((state) => {
            for (const song of state.songs) {
              if (song.id === state.selectedSongId) {
                const region = song.regions.find((region) => region.id === song.selectedRegionId)

                if (region) {
                  region.startTime = options.startTime ?? region.startTime
                  region.endTime = options.endTime ?? region.endTime

                  updateRegions(song.regions)
                }

                return
              }
            }
          }, "updateRegionTime")
        },

        selectRegion(id: number) {
          setState((state) => {
            for (const song of state.songs) {
              if (song.id === state.selectedSongId) {
                const region = song.regions.find((region) => region.id === song.selectedRegionId)

                if (region) {
                  song.selectedRegionId = region.id
                }

                return
              }
            }
          }, "selectRegion")
        },

        addEffectToRegion(effectName) {
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

          setState((state) => {
            // for (const song in state.songs) {
            //   const region = song.regions.find((region) => region.id === song.selectedRegionId)
            //   const effectIsExsists =
            //     region?.effects.findIndex((effect) => effect === effectName) === -1
            //   if (region) {
            //   }
            //   return
            // }
            // if (region && !effectIsExsists) {
            //   region.effects.push(effect)
            // }
          }, "addEffectToRegion")
        },

        setEffectDuration(type, duration) {
          // set(
          //   produce((state: Store) => {
          //     for (const song of state.songs) {
          //       if (song.id === state.selectedSongId) {
          //         for (let i = 0; i < song.regions.length; i++) {
          //           const region = song.regions[i]
          //           if (region.id === song.selectedRegionId) {
          //             for (let k = 0; k < song.regions[i].effects.length; k++) {
          //               const effect = song.regions[i].effects[k]
          //               if (effect.type === type) {
          //                 effect.duration = duration
          //                 break
          //               }
          //             }
          //             break
          //           }
          //         }
          //         return
          //       }
          //     }
          //   }),
          //   false,
          //   "setEffectDuration"
          // )
        },

        setEffectRange(type, range) {
          // set(
          //   produce((state: Store) => {
          //     const { regions, selectedRegion } = state
          //     for (let i = 0; i < regions.length; i++) {
          //       const region = regions[i]
          //       if (region.id === selectedRegion) {
          //         for (let k = 0; k < regions[i].effects.length; k++) {
          //           const effect = regions[i].effects[k]
          //           if (effect.type === type) {
          //             effect.range = range
          //             break
          //           }
          //         }
          //         break
          //       }
          //     }
          //   }),
          //   false,
          //   "setEffectRange"
          // )
        }
      }
    })
  )
)
