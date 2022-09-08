import * as yup from "yup"

export const updateBeatsSchema = yup.object({
  id: yup.number().required(),
  bpm: yup.number().required(),
  beatOffset: yup.number().required(),
  beatAroundEnd: yup.number().required()
})

export type UpdateBeatsSchema = yup.InferType<typeof updateBeatsSchema>
