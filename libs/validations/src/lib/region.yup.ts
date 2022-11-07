import * as yup from "yup";

const songId = yup.number();
const startTime = yup.number();
const endTime = yup.number();
const selectedEffect = yup.string().length(21);

export const addRegionSchema = yup.object({
  songId: songId.required(),
  startTime: startTime.required(),
  endTime: endTime.required(),
});

export const patchRegionSchema = yup.object({
  songId: songId.optional(),
  startTime: startTime.optional(),
  endTime: endTime.optional(),
  selectedEffect: selectedEffect.nullable(),
});

export type AddRegionSchema = yup.InferType<typeof addRegionSchema>;
export type PatchRegionSchema = yup.InferType<typeof patchRegionSchema>;
