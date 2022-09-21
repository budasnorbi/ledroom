import * as yup from "yup"

export const updateRegionSchema = yup.object({
  id: yup.string().length(21).required(),
  songId: yup.number().required(),
  startTime: yup.number().required(),
  endTime: yup.number().required()
})

export type UpdateRegionSchema = yup.InferType<typeof updateRegionSchema>
