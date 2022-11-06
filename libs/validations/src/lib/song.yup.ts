import * as yup from "yup";

const time = yup.number();
const bpm = yup.number();
const beatOffset = yup.number();
const beatAroundEnd = yup.number();
const volume = yup.number();
const selected = yup.boolean();
const lastTimePosition = yup.number();

export const optionalSongSchema = yup.object({
  time: time.optional(),
  bpm: bpm.optional(),
  beatOffset: beatOffset.optional(),
  beatAroundEnd: beatAroundEnd.optional(),
  volume: volume.optional(),
  selected: selected.optional(),
  lastTimePosition: lastTimePosition.optional(),
});

export type OptionalSongSchema = yup.InferType<typeof optionalSongSchema>;
