import { Store, SongsSlice, Song, EffectRegion } from "@type/store"
import { api } from "../api/instance"
import { StoreApi } from "zustand"
import { updateRegions } from "@utils/socket"
import { renderBeatRegions } from "@utils/renderBeatRegions"

export const songSlice = (
  setState: (fn: (state: Store) => void, actionName?: string) => void,
  get: StoreApi<Store>["getState"]
): SongsSlice => ({
  songs: [] as Song[],
  selectedSongId: null,

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
          ...song
        }))

        state.songs.push(...songsWithAdditionalProps)
        state.selectedSongId = songs[0].id
      }, "addSongs")
    }
  },

  addSongs(songs) {
    setState((state) => {
      const songsWithAdditionalProps: Song[] = songs.map((song) => ({ ...song, regions: [] }))

      state.songs.push(...songsWithAdditionalProps)
      state.selectedSongId = songsWithAdditionalProps[0].id
    }, "addSong")
  },

  removeSong(id) {
    setState((state) => {
      state.songs = state.songs.filter((song) => song.id !== id)
      state.wavesurferReady = false
      state.wavesurferIsPlaying = false

      if (state.songs.length === 0) {
        state.selectedSongId = null
      } else {
        state.selectedSongId = state.songs[state.songs.length - 1].id
      }
    }, "removeSong")
  },

  selectSong(id) {
    setState((state) => {
      state.selectedSongId = id
    }, "selectSong")
  },

  updateSongBeatConfig(bpm, beatOffset, beatAroundEnd, wavesurferRef) {
    const { selectedSongId } = get()
    api
      .put("/beat-config", {
        id: selectedSongId,
        bpm: bpm,
        beatOffset: beatOffset,
        beatAroundEnd: beatAroundEnd
      })
      .then(() => {
        return api.delete(`/regions/${selectedSongId}`)
      })
      .then(() => {
        setState((state) => {
          const song = state.songs.find((song) => song.id === state.selectedSongId)

          if (!song) {
            return
          }

          song.bpm = bpm
          song.beatOffset = beatOffset
          song.beatAroundEnd = beatAroundEnd
          song.regions = []

          const { addRegion, updateRegionTime, selectRegion } = get()

          renderBeatRegions(
            wavesurferRef,
            {
              beatAroundEnd,
              beatOffset,
              bpm
            },
            {
              addRegion,
              updateRegionTime,
              selectRegion
            },
            song.regions
          )
        }, "updateSongBeatsConfig")
      })
  },

  async addRegion(config) {
    const { selectedSongId } = get()
    api
      .post("region", {
        id: config.id,
        songId: selectedSongId,
        startTime: config.startTime,
        endTime: config.endTime
      })
      .then((res) => res.data)
      .then((data) => {
        const region: EffectRegion = {
          ...config
          //effects: []
        }

        setState((state) => {
          const song = state.songs.find((song) => song.id === state.selectedSongId)

          if (song) {
            song.regions.push(region)
            state.selectRegion(config.id)
          }
        }, "addRegion")
      })
  },

  selectRegion(id) {
    const { selectedSongId, songs } = get()

    const song = songs.find((song) => song.id === selectedSongId)

    if (!song || song.selectedRegionId === id) {
      return
    }

    api.put("/select-region", { songId: selectedSongId, regionId: id }).then(() => {
      setState((state) => {
        const song = state.songs.find((song) => song.id === state.selectedSongId)

        if (!song) {
          return
        }

        song.selectedRegionId = id
      }, "selectRegion")
    })
  },

  removeRegion() {
    setState((state) => {
      for (const song of state.songs) {
        if (song.id === state.selectedSongId) {
          song.regions = song.regions.filter((region) => region.id !== song.selectedRegionId)
          return
        }
      }
    })
  },

  async updateRegionTime(options) {
    const { selectedSongId, songs } = get()
    const song = songs.find((song) => song.id === selectedSongId)

    if (!song) {
      return
    }

    const region = song.regions.find((region) => region.id === options.id)

    if (!region) {
      return
    }

    if (options.startTime !== undefined && options.endTime === undefined) {
      if (options.startTime === region.startTime) {
        return
      }
    }

    if (options.endTime !== undefined && options.startTime === undefined) {
      if (options.endTime === region.endTime) {
        return
      }
    }

    if (options.startTime !== undefined && options.endTime !== undefined) {
      if (options.startTime === region.startTime && options.endTime === region.endTime) {
        return
      }
    }

    api
      .put("region", {
        songId: selectedSongId,
        id: options.id,
        startTime: options.startTime ?? region.startTime,
        endTime: options.endTime ?? region.endTime
      })
      .then(() => {
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
      })
  },

  async updateLastTimePosition(time) {
    const { selectedSongId, songs } = get()

    const song = songs.find((song) => song.id === selectedSongId)

    if (!song || song.lastTimePosition === time) {
      return
    }

    await api.put("/last-time-position", { time, id: get().selectedSongId }).then(() => {
      setState((state) => {
        const song = state.songs.find((song) => song.id === state.selectedSongId)

        if (song) {
          song.lastTimePosition = time
        }
      }, "updateLastTimePosition")
    })
  },

  updateSongVolume(volume) {
    const { selectedSongId, songs } = get()

    const song = songs.find((song) => song.id === selectedSongId)

    if (!song) {
      return
    }

    api.put("/volume", { volume, id: selectedSongId }).then(() => {
      setState((state) => {
        const song = state.songs.find((song) => song.id === state.selectedSongId)

        if (song) {
          song.volume = volume
        }
      }, "updateSongVolume")
    })
  }
})

//   addEffectToRegion(effectName) {
//     let effect: Step | Blink
//     switch (effectName) {
//       case "step": {
//         const stepEffect: Step = {
//           type: "step",
//           barCount: 50,
//           clipLed: [0, 0, 0],
//           direction: "left",
//           ledColors: [],
//           speed: 1,
//           range: [0, 826],
//           barColor: [255, 255, 255]
//         }
//         effect = stepEffect
//         break
//       }
//       case "blink": {
//         const blinkEffect: Blink = {
//           type: "blink",
//           bezierPoints: [0, 1, 0, 1],
//           duration: 1,
//           ledColors: [],
//           toColor: [255, 255, 255],
//           fromColor: [0, 0, 0],
//           watchOnlyColored: false,
//           range: [0, 826]
//         }
//         effect = blinkEffect
//         break
//       }
//     }

//     setState((state) => {
//       // for (const song in state.songs) {
//       //   const region = song.regions.find((region) => region.id === song.selectedRegionId)
//       //   const effectIsExsists =
//       //     region?.effects.findIndex((effect) => effect === effectName) === null
//       //   if (region) {
//       //   }
//       //   return
//       // }
//       // if (region && !effectIsExsists) {
//       //   region.effects.push(effect)
//       // }
//     }, "addEffectToRegion")
//   },

//   setEffectDuration(type, duration) {
//     // set(
//     //   produce((state: Store) => {
//     //     for (const song of state.songs) {
//     //       if (song.id === state.selectedSongId) {
//     //         for (let i = 0; i < song.regions.length; i++) {
//     //           const region = song.regions[i]
//     //           if (region.id === song.selectedRegionId) {
//     //             for (let k = 0; k < song.regions[i].effects.length; k++) {
//     //               const effect = song.regions[i].effects[k]
//     //               if (effect.type === type) {
//     //                 effect.duration = duration
//     //                 break
//     //               }
//     //             }
//     //             break
//     //           }
//     //         }
//     //         return
//     //       }
//     //     }
//     //   }),
//     //   false,
//     //   "setEffectDuration"
//     // )
//   },

//   setEffectRange(type, range) {
//     // set(
//     //   produce((state: Store) => {
//     //     const { regions, selectedRegion } = state
//     //     for (let i = 0; i < regions.length; i++) {
//     //       const region = regions[i]
//     //       if (region.id === selectedRegion) {
//     //         for (let k = 0; k < regions[i].effects.length; k++) {
//     //           const effect = regions[i].effects[k]
//     //           if (effect.type === type) {
//     //             effect.range = range
//     //             break
//     //           }
//     //         }
//     //         break
//     //       }
//     //     }
//     //   }),
//     //   false,
//     //   "setEffectRange"
//     // )
//   }
// }
