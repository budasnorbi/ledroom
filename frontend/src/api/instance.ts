import axios, { AxiosError } from "axios"
// import {
//   BadRequestException,
//   ClientError,
//   ForbiddenException,
//   InternalServerErrorException,
//   NotFoundException,
//   RequestBody,
//   UnauthorizedException,
//   UnprocessableEntityException
// } from "@type/api"
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_DOMAIN_FROM_PUBLIC,
  withCredentials: true,
  timeout: 5000
})

// export function api(
//   url: string,
//   body: RequestBody
// ): Promise<
//   | ClientError
//   | NotFoundException
//   | BadRequestException
//   | UnauthorizedException
//   | ForbiddenException
//   | UnprocessableEntityException
//   | InternalServerErrorException
// >

// export function api<ApiSuccessResponse extends { statusCode: 201 }>(
//   url: string,
//   body: RequestBody
// ): Promise<
//   | ApiSuccessResponse
//   | ClientError
//   | NotFoundException
//   | BadRequestException
//   | InternalServerErrorException
//   | UnauthorizedException
//   | ForbiddenException
//   | UnprocessableEntityException
// >

// export function api<ApiSuccessResponse extends { statusCode: 200 }, ErrorResponse>(
//   url: string
// ): Promise<
//   | ApiSuccessResponse
//   | Exclude<ErrorResponse, never>
//   | ClientError
//   | NotFoundException
//   | InternalServerErrorException
//   | UnauthorizedException
//   | ForbiddenException
// >

// export async function api<ApiSuccessResponse extends { statusCode: 200 | 201 }, ErrorResponse>(
//   url: string,
//   body?: RequestBody | never
// ) {
//   return instance[body ? "post" : "get"]<ApiSuccessResponse>(url, body)
//     .then((response) => {
//       return {
//         ...response.data,
//         statusCode: response.status
//       }
//     })
//     .catch((error: Error | AxiosError<ErrorResponse>) => {
//       console.log(error)
//       if (axios.isAxiosError(error)) {
//         if (error.response) {
//           /* @ts-ignore */
//           if (error.response.statusCode === undefined) {
//             /* @ts-ignore */
//             error.response.data.statusCode = error.response.status
//           }
//           return error.response.data
//         } else if (error.request) {
//           return {
//             statusCode: null,
//             error: "No Backend Response",
//             message: "A kapcsolat megszakadt a szerverrel"
//           }
//         } else {
//           return {
//             statusCode: null,
//             error: "Wrong Api Call",
//             message: "Váratlan hiba történt, kérjük vegye fel a kapcsolatot az oldal fejlesztőivel"
//           }
//         }
//       } else {
//         return {
//           statusCode: null,
//           error: "Wrong Api Call",
//           message: "Váratlan hiba történt, kérjük vegye fel a kapcsolatot az oldal fejlesztőivel"
//         }
//       }
//     })
// }
