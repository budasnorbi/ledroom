import * as yup from "yup"

export const volumeSchema = yup.object({
  id: yup.number().required(),
  volume: yup.number().required()
})

export type VolumeSchema = yup.InferType<typeof volumeSchema>
