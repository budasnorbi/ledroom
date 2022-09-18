import { StoreApi } from "zustand"
import { Store, SongsSlice, Song, EffectRegion } from "@type/store"
import api from "@api/web"
import { updateRegions } from "@api/socket"
import { renderBeatRegions } from "@utils/renderBeatRegions"

export const songInitialState = {
  songs: [],
  selectedSongId: null
}

export const songSlice = (
  setState: (fn: (state: Store) => void, actionName?: string) => void,
  get: StoreApi<Store>["getState"]
): SongsSlice => ({
  ...songInitialState,

  addSongs(data) {
    const { updateWavesurferReady, wavesurferReady } = get()

    if (wavesurferReady) {
      updateWavesurferReady(false)
    }

    setState((state) => {
      state.songs.push(...data.songs)
    }, "addSong")
    get().selectSong(data.selectedSongId)
  },

  async removeSong(id) {
    const deleteRes = await api.delete<{ selectedSongId: number | null }>(`/song/${id}`)

    if (!deleteRes) {
      return
    }

    const { updateWavesurferReady, wavesurferReady } = get()

    if (wavesurferReady) {
      updateWavesurferReady(false)
    }

    setState((state) => {
      state.songs = state.songs.filter((song) => song.id !== id)

      state.wavesurferIsPlaying = false

      state.selectedSongId = deleteRes.selectedSongId
    }, "removeSong")
  },

  async selectSong(id) {
    const { updateWavesurferReady, wavesurferReady } = get()

    const response = await api.put(`/select-song?id=${id}`)

    if (!response) {
      return
    }

    if (wavesurferReady) {
      updateWavesurferReady(false)
    }

    setState((state) => {
      const song = state.songs.find((song) => song.id === id)

      if (!song) {
        return
      }

      state.selectedSongId = id
    }, "selectSong")
  },

  async updateSongBeatConfig(bpm, beatOffset, beatAroundEnd, wavesurferRef) {
    const { selectedSongId, addRegion, updateRegionTime, selectRegion } = get()

    if (!selectedSongId) {
      return
    }

    const updateResponse = await api.put("/beat-config", {
      id: selectedSongId,
      bpm: bpm,
      beatOffset: beatOffset,
      beatAroundEnd: beatAroundEnd
    })

    if (!updateResponse) {
      return
    }

    const deleteResponse = await api.delete(`/regions/${selectedSongId}`)

    if (!deleteResponse) {
      return
    }

    setState((state) => {
      const song = state.songs.find((song) => song.id === state.selectedSongId)

      if (!song) {
        return
      }

      song.bpm = bpm
      song.beatOffset = beatOffset
      song.beatAroundEnd = beatAroundEnd
      song.regions = []

      renderBeatRegions(
        wavesurferRef,
        {
          beatAroundEnd,
          beatOffset,
          bpm,
          songId: selectedSongId
        },
        {
          addRegion,
          updateRegionTime,
          selectRegion
        }
      )
    }, "updateSongBeatsConfig")
  },

  async addRegion(config) {
    const region: EffectRegion = {
      ...config
      //effects: []
    }

    setState((state) => {
      const song = state.songs.find((song) => song.id === state.selectedSongId)

      if (!song) {
        return
      }

      song.regions.push(region)
      state.selectRegion(config.id)
    }, "addRegion")
  },

  async selectRegion(id) {
    const { selectedSongId, songs } = get()

    const song = songs.find((song) => song.id === selectedSongId)

    if (!song) {
      return
    }

    const response = await api.put("/select-region", { songId: song.id, regionId: id })

    if (!response) {
      return
    }

    setState((state) => {
      const song = state.songs.find((song) => song.id === state.selectedSongId) as Song

      song.selectedRegionId = id
    }, "selectRegion")
  },

  removeRegion() {
    setState((state) => {
      const song = state.songs.find((song) => song.id === state.selectedSongId)

      if (!song) {
        return
      }

      song.regions = song.regions.filter((region) => region.id !== song.selectedRegionId)
    }, "removeRegion")
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

    const response = await api.put("/region", {
      songId: song.id,
      id: options.id,
      startTime: options.startTime ?? region.startTime,
      endTime: options.endTime ?? region.endTime
    })

    if (!response) {
      return
    }

    setState((state) => {
      const song = state.songs.find((song) => song.id === selectedSongId)

      if (!song) {
        return
      }

      const region = song.regions.find((region) => region.id === song.selectedRegionId)

      if (!region) {
        return
      }

      region.startTime = options.startTime ?? region.startTime
      region.endTime = options.endTime ?? region.endTime

      updateRegions(song.regions)
    }, "updateRegionTime")
  },

  async updateLastTimePosition(time) {
    const { selectedSongId, songs } = get()

    const song = songs.find((song) => song.id === selectedSongId)

    if (!song || song.lastTimePosition === time) {
      return
    }

    const response = await api.put("/last-time-position", { time, id: song.id })

    if (!response) {
      return
    }

    setState((state) => {
      const song = state.songs.find((song) => song.id === state.selectedSongId)

      if (!song) {
        return
      }

      song.lastTimePosition = time
    }, "updateLastTimePosition")
  },

  async updateSongVolume(volume) {
    const { selectedSongId, songs } = get()

    const song = songs.find((song) => song.id === selectedSongId)

    if (!song) {
      return
    }

    const response = await api.put(
      "/volume",
      { volume, id: song.id },
      { "Content-Type": "application/json" }
    )

    if (!response) {
      return
    }

    setState((state) => {
      const song = state.songs.find((song) => song.id === state.selectedSongId)

      if (!song) {
        return
      }

      song.volume = volume
    }, "updateSongVolume")
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
