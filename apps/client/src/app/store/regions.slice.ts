import { DBSong, SelectRegiongResponse } from "@ledroom2/types";
import { SelectRegionSchema } from "@ledroom2/validations";
import { StoreApi } from "zustand";
import { updateRegions } from "../api/socket";
import { api } from "../api/web";
import { Methods } from "../types/api";
import { Store, EffectSlice, RegionsSlice } from "../types/store";

export const regionsInitialState = {
  regions: [],
};

export const regionsSlice = (
  set: (fn: (state: Store) => void, actionName?: string) => void,
  get: StoreApi<Store>["getState"]
): RegionsSlice => ({
  ...regionsInitialState,
  async addRegion(newRegion) {
    set((state) => {
      state.regions.push(newRegion);

      const song = state.songs.find(
        (song) => song.id === newRegion.songId
      ) as DBSong;
      song.selectedRegionId = newRegion.id;
    }, "addRegion");
  },

  async selectRegion(selectedRegion, wavesurfer) {
    const { selectedSongId } = get();
    if (selectedSongId === null) {
      return;
    }

    const response = await api<SelectRegiongResponse, SelectRegionSchema>(
      `/region/${selectedRegion.id}/select`,
      {
        method: Methods.PATCH,
        body: {
          songId: selectedSongId,
        },
      }
    );

    if (response.statusCode !== 204) {
      return;
    }

    for (const key in wavesurfer.regions.list) {
      const _region = wavesurfer.regions.list[key];
      if (_region.element.getAttribute("data-rangetype") === "effect-range") {
        _region.update({
          color: "rgba(0, 0, 255, 0.15)",
        });
      }
    }

    selectedRegion.update({
      color: "rgba(255, 0, 0, 0.15)",
    });

    set((state) => {
      const song = state.songs.find((song) => song.id === state.selectedSongId);

      if (!song) {
        return;
      }

      song.selectedRegionId = selectedRegion.id;
    }, "selectRegion");
  },

  // NEED TO SEPARATE THE SIDEEFFECT AFTER SUCCESFUL API CALL
  async removeSelectedRegion(wavesurferRef) {
    const { songs, selectedSongId } = get();
    const song = songs.find((song) => song.id === selectedSongId);

    if (!song || song.selectedRegionId === null) {
      return;
    }

    const response = await api(`/region/${song.selectedRegionId}`, {
      method: Methods.DELETE,
    });

    if (response.statusCode !== 204) {
      // handle errors
      return;
    }

    set((state) => {
      const song = state.songs.find(
        (song) => song.id === selectedSongId
      ) as DBSong;

      state.regions = state.regions.filter(
        (region) => region.id !== (song.selectedRegionId as string)
      );

      wavesurferRef.regions.list[song.selectedRegionId as string].remove();
      song.selectedRegionId = null;
    }, "removeRegion");
  },

  async updateRegionTime(targetedRegion) {
    const { selectedSongId, songs, regions } = get();
    const song = songs.find((song) => song.id === selectedSongId);

    if (!song) {
      return;
    }

    const region = regions.find((region) => region.id === targetedRegion.id);

    if (!region) {
      return;
    }

    set((state) => {
      const region = state.regions.find(
        (region) => region.id === targetedRegion.id
      );

      if (!region) {
        return;
      }

      region.startTime = targetedRegion.startTime ?? region.startTime;
      region.endTime = targetedRegion.endTime ?? region.endTime;

      updateRegions(state.regions);
    }, "updateRegionTime");
  },
});
