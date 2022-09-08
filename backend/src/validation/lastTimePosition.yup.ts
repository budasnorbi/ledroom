import * as yup from "yup"

export const lastTimePositionSchema = yup.object({
  id: yup.number().required(),
  time: yup.number().required()
})

export type LastTimePositionSchema = yup.InferType<typeof lastTimePositionSchema>
