import * as yup from "yup"

const regionId = yup.string().length(21).required()
const ledColors = yup.array().length(3).of(yup.number().min(0).max(255)).required()
const barColor = yup.array().length(3).of(yup.number().min(0).max(255)).required()
const clipColor = yup.array().length(3).of(yup.number().min(0).max(255)).required()
const speed = yup.number().min(1).max(255).required()
const barCount = yup.number().min(1).max(826).required()
const direction = yup.string().oneOf(["left", "right"]).required() as yup.StringSchema<
  "left" | "right"
>
const range = yup.array().length(2).of(yup.number().min(0).max(826)).required()

export const stepEffectSchema = yup.object({
  regionId,
  ledColors,
  barColor,
  clipColor,
  speed,
  barCount,
  direction,
  range
})

export type StepEffectSchema = yup.InferType<typeof stepEffectSchema>
