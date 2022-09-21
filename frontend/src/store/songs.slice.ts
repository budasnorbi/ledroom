import { StoreApi } from "zustand"
import type { Store, SongsSlice } from "@type/store"

import api from "@api/web"
import { updateRegions } from "@api/socket"
import { renderBeatRegions } from "@utils/renderBeatRegions"
import { DBSong } from "@backend/db-entities"
import {
  BeatConfigResponse,
  DeleteSongResponse,
  SelectRegiongResponse,
  SelectSongResponse,
  UpdateLastTimePositionResponse,
  UpdateRegiongResponse,
  UpdateVolumeResponse
} from "@backend/endpoints"

export const songInitialState = {
  songs: [],
  regions: [],
  effects: [],
  selectedSongId: null
}

export const songSlice = (
  setState: (fn: (state: Store) => void, actionName?: string) => void,
  get: StoreApi<Store>["getState"]
): SongsSlice => ({
  ...songInitialState,

  addSong(data) {
    const { updateWavesurferReady, wavesurferReady, selectSong } = get()

    if (wavesurferReady) {
      updateWavesurferReady(false)
    }

    setState((state) => {
      state.songs.push(data)
    }, "addSong")

    selectSong(data.id)
  },

  addSongs({ selectedRegionId, songs }) {
    setState((state) => {
      for (let i = 0; i < songs.length; i++) {
        const { regions: _regions, ...song } = songs[i]
        state.songs.push(song)

        for (let k = 0; k < _regions.length; k++) {
          const { effects: _effects, ...region } = _regions[k]
          state.regions.push(region)

          for (let l = 0; l < _effects.length; l++) {
            const effect = _effects[i]
            state.effects.push(effect)
          }
        }
      }
    }, "addSongs")

    get().selectSong(selectedRegionId)
  },

  async removeSong(songId) {
    const deleteRes = await api.delete<DeleteSongResponse>(`/song/${songId}`)

    if (!deleteRes) {
      return
    }

    const { updateWavesurferReady, wavesurferReady } = get()

    if (wavesurferReady) {
      updateWavesurferReady(false)
    }

    setState((state) => {
      state.wavesurferIsPlaying = false

      const songRegionIds = state.regions
        .filter((region) => region.songId === songId)
        .map((region) => region.id)

      // Clearing effects
      state.effects = state.effects.filter(
        (effect) => songRegionIds.includes(effect.regionId) === false
      )

      // Clearing regions
      state.regions = state.regions.filter((region) => region.songId !== songId)

      // Clearing song
      state.songs = state.songs.filter((song) => song.id !== songId)

      const selectedSongId =
        state.songs.find((song, index, array) => index === array.length - 1)?.id ?? null

      state.selectedSongId = selectedSongId
    }, "removeSong")
  },

  async selectSong(id) {
    const { updateWavesurferReady, wavesurferReady, selectedSongId } = get()

    if (selectedSongId !== id && id !== null) {
      const response = await api.put<SelectSongResponse>(`/select-song?id=${id}`)

      if (!response) {
        return
      }
    }

    if (wavesurferReady) {
      updateWavesurferReady(false)
    }

    setState((state) => {
      state.selectedSongId = id
    }, "selectSong")
  },

  async updateSongBeatConfig(bpm, beatOffset, beatAroundEnd, wavesurferRef) {
    const { selectedSongId, addRegion, updateRegionTime, selectRegion } = get()

    if (!selectedSongId) {
      return
    }

    const updateResponse = await api.put<BeatConfigResponse>("/beat-config", {
      id: selectedSongId,
      bpm: bpm,
      beatOffset: beatOffset,
      beatAroundEnd: beatAroundEnd
    })

    if (!updateResponse) {
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

      const removedRegions = state.regions
        .filter((region) => region.songId === song.id)
        .map((region) => region.id)

      // Clear regions
      state.regions = state.regions.filter((region) => region.songId !== song.id)

      // Clear effects
      state.effects = state.effects.filter(
        (effect) => removedRegions.includes(effect.regionId) === false
      )

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

  async addRegion(newRegion) {
    setState((state) => {
      state.regions.push(newRegion)
    }, "addRegion")

    get().selectRegion(newRegion.id)
  },

  async selectRegion(id) {
    const { selectedSongId, songs } = get()

    const song = songs.find((song) => song.id === selectedSongId)

    if (!song) {
      return
    }

    const response = await api.put<SelectRegiongResponse>("/select-region", {
      songId: song.id,
      regionId: id
    })

    if (!response) {
      return
    }

    setState((state) => {
      const song = state.songs.find((song) => song.id === state.selectedSongId)

      if (!song) {
        return
      }

      song.selectedRegionId = id
    }, "selectRegion")
  },

  // removeRegion() {
  //   setState((state) => {
  //     const song = state.songs.find((song) => song.id === state.selectedSongId)

  //     if (!song) {
  //       return
  //     }

  //     song.regions = song.regions.filter((region) => region.id !== song.selectedRegionId)
  //   }, "removeRegion")
  // },

  async updateRegionTime(targetedRegion) {
    const { selectedSongId, songs, regions } = get()
    const song = songs.find((song) => song.id === selectedSongId)

    if (!song) {
      return
    }

    const region = regions.find((region) => region.id === targetedRegion.id)

    if (!region) {
      return
    }

    if (targetedRegion.startTime !== undefined && targetedRegion.endTime === undefined) {
      if (targetedRegion.startTime === region.startTime) {
        return
      }
    }

    if (targetedRegion.endTime !== undefined && targetedRegion.startTime === undefined) {
      if (targetedRegion.endTime === region.endTime) {
        return
      }
    }

    if (targetedRegion.startTime !== undefined && targetedRegion.endTime !== undefined) {
      if (
        targetedRegion.startTime === region.startTime &&
        targetedRegion.endTime === region.endTime
      ) {
        return
      }
    }

    const response = await api.put<UpdateRegiongResponse>("/region", {
      songId: song.id,
      id: targetedRegion.id,
      startTime: targetedRegion.startTime ?? region.startTime,
      endTime: targetedRegion.endTime ?? region.endTime
    })

    if (!response) {
      return
    }

    setState((state) => {
      const region = state.regions.find((region) => region.id === targetedRegion.id)

      if (!region) {
        return
      }

      region.startTime = targetedRegion.startTime ?? region.startTime
      region.endTime = targetedRegion.endTime ?? region.endTime

      updateRegions(state.regions)
    }, "updateRegionTime")
  },

  async updateLastTimePosition(time) {
    const { selectedSongId, songs } = get()

    const song = songs.find((song) => song.id === selectedSongId)

    if (!song || song.lastTimePosition === time) {
      return
    }

    const response = await api.put<UpdateLastTimePositionResponse>("/last-time-position", {
      time,
      id: song.id
    })

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

    const response = await api.put<UpdateVolumeResponse>(
      "/volume",
      { volume, id: song.id },
      { "Content-Type": "application/json" }
    )

    if (!response) {
      return
    }

    setState((state) => {
      const song = state.songs.find((song) => song.id === state.selectedSongId) as DBSong
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
