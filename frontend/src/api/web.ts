import type {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException
} from "@backend/backend-errors"
import { Methods } from "@type/api"

type _BadRequestException = BadRequestException & { statusCode: 400 }
type _InternalServerErrorException = InternalServerErrorException & { statusCode: 500 }
type _NotFoundException = NotFoundException & { statusCode: 404 }
type _UnprocessableEntityException = UnprocessableEntityException & { statusCode: 422 }

interface ApiCallError {
  statusCode: null
  message: "Api call error"
}

export async function api<ServerResponse>(
  endpoint: string,
  customConfig: RequestInit & { method: Methods.GET }
): Promise<
  | ApiCallError
  | _BadRequestException
  | _NotFoundException
  | _InternalServerErrorException
  | { data: ServerResponse; statusCode: 200 }
>

export async function api<ServerResponse, RequestBody>(
  endpoint: string,
  customConfig: Omit<RequestInit, "body"> & { method: Methods.POST; body: RequestBody }
): Promise<
  | ApiCallError
  | _BadRequestException
  | _NotFoundException
  | _InternalServerErrorException
  | _UnprocessableEntityException
  | { data: ServerResponse; statusCode: 201 }
>

export async function api<ServerResponse = void, RequestBody = never>(
  endpoint: string,
  customConfig: Omit<RequestInit, "body"> & {
    method: Methods.PATCH | Methods.DELETE
    body?: RequestBody
  }
): Promise<
  | ApiCallError
  | _BadRequestException
  | _NotFoundException
  | _InternalServerErrorException
  | _UnprocessableEntityException
  | { statusCode: 204 }
>

export async function api<ServerResponse, RequestBody>(
  endpoint: string,
  customConfig: RequestInit
): Promise<
  | ApiCallError
  | BadRequestException
  | NotFoundException
  | InternalServerErrorException
  | UnprocessableEntityException
  | { data?: ServerResponse; statusCode: 200 | 201 | 204 }
> {
  /* @ts-ignore */
  if (customConfig.headers && (customConfig.headers["Content-Type"] as any) === "inherit") {
    /* @ts-ignore */
    delete customConfig.headers["Content-Type"]
  }

  if (!customConfig.headers) {
    customConfig.headers = {}
    customConfig.headers["Content-Type"] = "application/json"
  }

  if (customConfig.body && customConfig.body.constructor.name === "Object") {
    customConfig.body = JSON.stringify(customConfig.body)
  }

  let response: Response

  try {
    response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN_FROM_PUBLIC}${endpoint}`,
      customConfig
    )
  } catch (error) {
    // Catching client side calling errors
    return {
      statusCode: null,
      message: "Api call error"
    }
  }

  if (response.status === 204) {
    return { statusCode: response.status }
  }

  const data: ServerResponse = await response.json()
  return { data, statusCode: response.status as 200 | 201 | 204 }
}
