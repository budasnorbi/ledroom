import * as yup from "yup"

export const selectRegionSchema = yup.object({
  songId: yup.number().required(),
  regionId: yup.string().length(36).required()
})

export type SelectRegionSchema = yup.InferType<typeof selectRegionSchema>
