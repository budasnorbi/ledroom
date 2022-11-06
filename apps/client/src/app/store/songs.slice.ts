import { StoreApi } from "zustand";
import type { Store, SongsSlice } from "../types/store";

import { api } from "../api/web";
import { updateRegions } from "../api/socket";

import {
  DBSong,
  SelectRegiongResponse,
  SelectSongResponse,
  UpdateLastTimePositionResponse,
  UpdateVolumeResponse,
} from "@ledroom2/types";
import type {
  SelectRegionSchema,
  VolumeSchema,
  LastTimePositionSchema,
  StepEffectSchema,
} from "@ledroom2/validations";
import { Methods } from "../types/api";
import { StepEffect } from "@ledroom2/models";

export const songInitialState = {
  songs: [],
  regions: [],
  effects: [],
  selectedSongId: null,
};

export const songSlice = (
  set: (fn: (state: Store) => void, actionName?: string) => void,
  get: StoreApi<Store>["getState"]
): SongsSlice => ({
  ...songInitialState,

  addSong(data) {
    const { updateWavesurferReady, wavesurferReady, selectSong } = get();

    if (wavesurferReady) {
      updateWavesurferReady(false);
    }

    set((state) => {
      state.songs.push(data);
    }, "addSong");

    selectSong(data.id);
  },

  addSongs({ songs, selectedRegionId }) {
    set((state) => {
      for (let i = 0; i < songs.length; i++) {
        const { regions: _regions, ...song } = songs[i];
        state.songs.push(song);
        for (let k = 0; k < _regions.length; k++) {
          const { stepEffect, ...region } = _regions[k];
          state.regions.push(region);
          if (stepEffect) {
            state.effects.push({ ...stepEffect, type: "step" });
          }
        }
      }

      state.selectedSongId = selectedRegionId;
    }, "addSongs");
  },

  async removeSong(songId) {
    const response = await api(`/song/${songId}`, {
      method: Methods.DELETE,
    });

    if (response.statusCode !== 204) {
      // handle error
      return;
    }

    set((state) => {
      state.wavesurferIsPlaying = false;

      const songRegionIds = state.regions
        .filter((region) => region.songId === songId)
        .map((region) => region.id);

      // Clearing effects
      state.effects = state.effects.filter(
        (effect) => songRegionIds.includes(effect.regionId) === false
      );

      // Clearing regions
      state.regions = state.regions.filter(
        (region) => region.songId !== songId
      );

      // Clearing song
      state.songs = state.songs.filter((song) => song.id !== songId);

      const selectedSongId =
        state.songs.find((song, index, array) => index === array.length - 1)
          ?.id ?? null;

      state.selectedSongId = selectedSongId;
    }, "removeSong");
  },

  async selectSong(id) {
    const response = await api<SelectSongResponse>(`/song/${id}/select`, {
      method: Methods.PATCH,
    });

    if (response.statusCode !== 204) {
      return;
    }

    set((state) => {
      state.wavesurferReady = false;
      state.selectedSongId = id;
    }, "selectSong");
  },

  updateSongBeatConfig(bpm, beatOffset, beatAroundEnd) {
    set((state) => {
      const song = state.songs.find(
        (song) => song.id === state.selectedSongId
      ) as DBSong;

      song.bpm = bpm;
      song.beatOffset = beatOffset;
      song.beatAroundEnd = beatAroundEnd;

      const removedRegions = state.regions
        .filter((region) => region.songId === song.id)
        .map((region) => region.id);

      // Clear regions
      state.regions = state.regions.filter(
        (region) => region.songId !== song.id
      );

      // Clear effects
      state.effects = state.effects.filter(
        (effect) => removedRegions.includes(effect.regionId) === false
      );
    }, "updateSongBeatsConfig");
  },

  async updateLastTimePosition(time) {
    const { selectedSongId, songs } = get();

    const song = songs.find((song) => song.id === selectedSongId);

    if (!song || song.lastTimePosition === time) {
      return;
    }

    const response = await api<
      UpdateLastTimePositionResponse,
      LastTimePositionSchema
    >(`/song/${song.id}/last-time-position`, {
      method: Methods.PATCH,
      body: {
        time,
      },
    });

    if (response.statusCode !== 204) {
      return;
    }

    set((state) => {
      const song = state.songs.find((song) => song.id === state.selectedSongId);

      if (!song) {
        return;
      }

      song.lastTimePosition = time;
    }, "updateLastTimePosition");
  },

  async updateSongVolume(volume) {
    const { selectedSongId, songs } = get();

    const song = songs.find((song) => song.id === selectedSongId);

    if (!song) {
      return;
    }

    const response = await api<UpdateVolumeResponse, VolumeSchema>(
      `/song/${song.id}/volume`,
      {
        method: Methods.PATCH,
        headers: {
          "Content-Type": "application/json",
        },
        body: { volume },
      }
    );

    if (response.statusCode !== 204) {
      return;
    }

    set((state) => {
      const song = state.songs.find(
        (song) => song.id === state.selectedSongId
      ) as DBSong;
      song.volume = volume;
    }, "updateSongVolume");
  },
});

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

//     set(async (state) => {
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
