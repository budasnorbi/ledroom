import { StepEffectSchema, stepEffectSchema } from "@ledroom2/validations"
import { useFormik } from "formik"

import type { FC } from "react"

interface Props {
  regionId: string
}

export const StepEffectForm: FC<Props> = ({ regionId }) => {
  const formik = useFormik<StepEffectSchema>({
    initialValues: {
      regionId,
      ledColors: [0, 0, 0],
      barColor: [0, 0, 255],
      clipColor: [0, 0, 0],
      speed: 1,
      barCount: 50,
      direction: "left",
      range: [0, 826]
    },
    validationSchema: stepEffectSchema,
    onSubmit: async (values, helper) => {}
  })

  return (
    <div>
      <form onSubmit={formik.handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            Username
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            type="text"
            placeholder="Username"
          />
        </div>
        <button type="submit">{formik.isSubmitting ? "Mentés..." : "Mentés"}</button>
      </form>
    </div>
  )
}
