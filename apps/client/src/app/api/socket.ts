import { DBRegion } from "@ledroom2/types"
import { io } from "socket.io-client"
export const socket = io(`${process.env["NX_API_URL"]}`)

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

export const renderEffectChanges = () => {
  socket.emit("render-effect-change")
}

export const closeSocket = () => {
  socket.close()
}
