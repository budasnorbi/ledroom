import {
  AddStepEffect,
  DBRegion,
  DBSong,
  PatchRegionResponse,
} from "@ledroom2/types";
import { PatchRegionSchema, StepEffectSchema } from "@ledroom2/validations";
import { StoreApi } from "zustand";
import { api } from "../api/web";
import { Methods } from "../types/api";
import { ClientStepEffect } from "../types/effect";
import { Store, EffectSlice } from "../types/store";

export const effectInitialState = {
  effects: [],
};

export const effectSlice = (
  set: (fn: (state: Store) => void, actionName?: string) => void,
  get: StoreApi<Store>["getState"]
): EffectSlice => ({
  ...effectInitialState,
  async updateStepEffect(partialStep) {
    const { selectedSongId, songs, effects } = get();

    const songIndex = songs.findIndex(
      (song) => song.id === selectedSongId
    ) as number;

    const effectIndex = effects.findIndex(
      (effect) =>
        songs[songIndex].selectedRegionId === effect.regionId &&
        effect.type === "step"
    );

    if (effectIndex === -1) {
      return;
    }

    const response = await api<
      { statusCode: 204 },
      Partial<ClientStepEffect> & { regionId: string; id: string }
    >(`/effect/step/${effects[effectIndex].id}`, {
      method: Methods.PATCH,
      body: {
        ...partialStep,
        regionId: effects[effectIndex].regionId,
        id: effects[effectIndex].id,
      },
    });

    if (response.statusCode !== 204) {
      return;
    }

    set((state) => {
      const effect = state.effects.find(
        (effect) =>
          state.songs[songIndex].selectedRegionId === effect.regionId &&
          effect.type === "step"
      ) as ClientStepEffect;

      (Object.keys(partialStep) as Array<keyof typeof partialStep>).forEach(
        (key) => {
          /* @ts-ignore */
          effect[key] = partialStep[key];
        }
      );
    });
  },
  async selectOrAddEffect(type) {
    const { selectedSongId, songs, effects, regions } = get();

    const songIndex = songs.findIndex(
      (song) => song.id === selectedSongId
    ) as number;
    const regionIndex = regions.findIndex(
      (region) => region.id === songs[songIndex].selectedRegionId
    ) as number;

    if (type === "") {
      const response = await api<
        PatchRegionResponse,
        Partial<PatchRegionSchema>
      >(`/region/${songs[songIndex].selectedRegionId}`, {
        method: Methods.PATCH,
        body: {
          selectedEffect: null,
        },
      });

      if (response.statusCode !== 204) {
        return;
      }

      set((state) => {
        state.regions[regionIndex].selectedEffect = null;
      });
    } else {
      // need to check if the effect already exsist by its type
      const effect = effects.find(
        (effect) =>
          songs[songIndex].selectedRegionId === effect.regionId &&
          effect.type === type
      );
      if (effect) {
        const response = await api<
          PatchRegionResponse,
          Partial<PatchRegionSchema>
        >(`/region/${songs[songIndex].selectedRegionId}`, {
          method: Methods.PATCH,
          body: {
            selectedEffect: effect.id,
          },
        });

        if (response.statusCode !== 204) {
          return;
        }

        set((state) => {
          state.regions[regionIndex].selectedEffect = effect.id;
        });
      } else {
        const initialStep: StepEffectSchema = {
          regionId: songs[songIndex].selectedRegionId as string,
          ledColors: { r: 0, g: 0, b: 0, a: 0 },
          barColor: { r: 0, g: 0, b: 0, a: 0 },
          clipColor: { r: 0, g: 0, b: 0, a: 0 },
          speed: 1,
          barCount: 50,
          direction: "left",
          rangeStart: 0,
          rangeEnd: 826,
        };

        const effectCreateResponse = await api<AddStepEffect, StepEffectSchema>(
          "/effect/step",
          {
            method: Methods.POST,
            body: initialStep,
          }
        );

        if (effectCreateResponse.statusCode !== 201) {
          return;
        }

        const regionEffectSelectionResponse = await api<
          PatchRegionResponse,
          Partial<PatchRegionSchema>
        >(`/region/${songs[songIndex].selectedRegionId}`, {
          method: Methods.PATCH,
          body: {
            selectedEffect: effectCreateResponse.data.id,
          },
        });

        if (regionEffectSelectionResponse.statusCode !== 204) {
          return;
        }

        set((state) => {
          state.effects.push({
            ...initialStep,
            type: "step",
            id: effectCreateResponse.data.id,
          });

          for (const region of state.regions) {
            if (region.id === state.songs[songIndex].selectedRegionId) {
              region.selectedEffect = effectCreateResponse.data.id;
            }
          }
        }, "addStepEffect");
      }
    }
  },
});
