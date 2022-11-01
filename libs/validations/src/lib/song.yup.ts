import * as yup from "yup"

const time = yup.number().required()
const bpm = yup.number().required()
const beatOffset = yup.number().required()
const beatAroundEnd = yup.number().required()
const volume = yup.number().required()

export const lastTimePositionSchema = yup.object({
  time
})

export const updateBeatsSchema = yup.object({
  bpm,
  beatOffset,
  beatAroundEnd
})

export const volumeSchema = yup.object({
  volume
})

export type VolumeSchema = yup.InferType<typeof volumeSchema>
export type UpdateBeatsSchema = yup.InferType<typeof updateBeatsSchema>
export type LastTimePositionSchema = yup.InferType<typeof lastTimePositionSchema>
