import * as yup from "yup"

const id = yup.string().uuid()
const rgbColor = yup.object({
  r: yup.number().min(0).max(255).required(),
  g: yup.number().min(0).max(255).required(),
  b: yup.number().min(0).max(255).required(),
  a: yup.number().min(0).max(1).optional()
})

const regionId = yup.string().uuid()
const barColor = rgbColor
const clipColor = rgbColor
const speed = yup.number().min(1).max(255)
const barCount = yup.number().min(1).max(900)
const direction = yup.string().oneOf(["left", "right"]) as yup.StringSchema<"left" | "right">
const rangeStart = yup.number().min(0).max(900)
const rangeEnd = yup.number().min(0).max(900)
const selected = yup.boolean()

export const stepEffectSchema = yup.object({
  regionId: regionId.required(),
  barColor: barColor.required(),
  clipColor: clipColor.required(),
  speed: speed.required(),
  barCount: barCount.required(),
  direction: direction.required(),
  selected: selected.required()
})

export type StepEffectSchema = yup.InferType<typeof stepEffectSchema>

const optionalRgbColor = yup
  .object()
  .default(null)
  .nullable()
  .shape({
    r: yup.number().min(0).max(255).required(),
    g: yup.number().min(0).max(255).required(),
    b: yup.number().min(0).max(255).required(),
    a: yup.number().min(0).max(1).optional()
  })

export const partialStepEffectSchema = yup.object({
  barColor: optionalRgbColor,
  clipColor: optionalRgbColor,
  speed: speed.optional(),
  barCount: barCount.optional(),
  direction: direction.optional(),
  selected: selected.optional()
})

export type PartialStepEffectSchema = yup.InferType<typeof partialStepEffectSchema>
export type PatchStepEffectSchema = yup.InferType<typeof partialStepEffectSchema>
