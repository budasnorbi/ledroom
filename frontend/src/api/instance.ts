import axios, { AxiosError } from "axios"
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_DOMAIN_FROM_PUBLIC + "/api",
  withCredentials: true,
  timeout: 5000
})
