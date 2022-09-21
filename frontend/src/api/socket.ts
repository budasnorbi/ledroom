import { DBRegion } from "@backend/db-entities"
import { io } from "socket.io-client"
export const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_DOMAIN_FROM_PUBLIC}`)

export const sendTimeupdate = (time: number) => {
  socket.emit("timeupdate", time)
}

export const sendStart = (time: number) => {
  socket.emit("start", time)
}

export const sendStop = () => {
  socket.emit("stop")
}

export const sendSeek = (time: number) => {
  socket.emit("seek", time)
}

export const sendReset = () => {
  socket.emit("reset")
}

export const updateRegions = (regions: DBRegion[]) => {
  socket.emit("update-regions", regions)
}

export const closeSocket = () => {
  socket.close()
}
