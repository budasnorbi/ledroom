import * as yup from "yup"

const name = yup.string().required()
const songId = yup.number().required()
const startTime = yup.number().required()
const endTime = yup.number().required()

export const addRegionSchema = yup.object({
  songId,
  startTime,
  endTime
})

export const selectRegionSchema = yup.object({
  songId
})

export const updateRegionSchema = yup.object({
  songId,
  startTime,
  endTime
})

export const updateRegionNameSchema = yup.object({
  songId,
  name
})

export type UpdateRegionNameSchema = yup.InferType<typeof updateRegionNameSchema>
export type AddRegionSchema = yup.InferType<typeof addRegionSchema>
export type UpdateRegionSchema = yup.InferType<typeof updateRegionSchema>
export type SelectRegionSchema = yup.InferType<typeof selectRegionSchema>
