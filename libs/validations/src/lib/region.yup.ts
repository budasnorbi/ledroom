import * as yup from "yup"

const songId = yup.string().uuid()
const startTime = yup.number()
const endTime = yup.number()

export const addRegionSchema = yup.object({
  songId: songId.required(),
  startTime: startTime.required(),
  endTime: endTime.required()
})

export const patchRegionSchema = yup.object({
  songId: songId.optional(),
  startTime: startTime.optional(),
  endTime: endTime.optional()
})

export type AddRegionSchema = yup.InferType<typeof addRegionSchema>
export type PatchRegionSchema = yup.InferType<typeof patchRegionSchema>
