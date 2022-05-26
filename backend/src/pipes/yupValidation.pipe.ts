import { PipeTransform, Injectable, UnprocessableEntityException } from "@nestjs/common"
import { BaseSchema } from "yup"

@Injectable()
export class YupValidationPipe implements PipeTransform {
  constructor(private readonly schema: BaseSchema) {}

  async transform(value: any) {
    try {
      await this.schema.validate(value, { abortEarly: false })
      return value
    } catch (error: any) {
      const fieldsError = {}
      for (let i = 0; i < error.inner.length; i++) {
        const fieldError = error.inner[i]
        fieldsError[fieldError.path] = fieldError.errors
      }
      throw new UnprocessableEntityException({
        error: "Unprocessable Entity",
        statusCode: 422,
        validations: fieldsError
      })
    }
  }
}
