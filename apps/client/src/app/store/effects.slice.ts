import { AddStepEffect } from "@ledroom2/types";
import { StepEffectSchema } from "@ledroom2/validations";
import { StoreApi } from "zustand";
import { api } from "../api/web";
import { Methods } from "../types/api";
import { ClientStepEffect, ClientStepEffectKeys } from "../types/effect";
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

    const song = songs.find((song) => song.id === selectedSongId);

    if (!song) {
      return;
    }

    const effect = effects.find(
      (effect) =>
        song.selectedRegionId === effect.regionId && effect.type === "step"
    );

    if (!effect) {
      return;
    }

    const response = await api<
      { statusCode: 204 },
      Partial<ClientStepEffect> & { regionId: string; id: string }
    >("/effect/step", {
      method: Methods.PATCH,
      body: { ...partialStep, regionId: effect.regionId, id: effect.id },
    });

    if (response.statusCode !== 204) {
      return;
    }

    set((state) => {
      const song = state.songs.find((song) => song.id === selectedSongId);

      if (!song) {
        return;
      }

      const effect = state.effects.find(
        (effect) =>
          song.selectedRegionId === effect.regionId && effect.type === "step"
      );

      if (!effect) {
        return;
      }

      (Object.keys(partialStep) as Array<keyof typeof partialStep>).forEach(
        (key) => {
          /* @ts-ignore */
          effect[key] = partialStep[key];
        }
      );
    });
  },
  async selectOrAddEffect(type) {
    if (type === "") {
      return;
    }

    const { selectedSongId, songs, effects } = get();

    const song = songs.find((song) => song.id === selectedSongId);

    if (!song) {
      return;
    }

    const effect = effects.find(
      (effect) =>
        song.selectedRegionId === effect.regionId && effect.type === type
    );

    if (!effect) {
      const initialStep: StepEffectSchema = {
        regionId: song.selectedRegionId as string,
        ledColors: { r: 0, g: 0, b: 0, a: 0 },
        barColor: { r: 0, g: 0, b: 0, a: 0 },
        clipColor: { r: 0, g: 0, b: 0, a: 0 },
        speed: 1,
        barCount: 50,
        direction: "left",
        rangeStart: 0,
        rangeEnd: 826,
      };

      const response = await api<AddStepEffect, StepEffectSchema>(
        "/effect/step",
        {
          method: Methods.POST,
          body: initialStep,
        }
      );

      if (response.statusCode !== 201) {
        return;
      }

      set((state) => {
        state.effects.push({
          ...initialStep,
          type: "step",
          id: response.data.id,
        });
      }, "addStepEffect");
    }
  },
});
