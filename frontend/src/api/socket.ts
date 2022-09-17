import { io } from "socket.io-client"
export const socket = io("http://localhost:3001/")

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

export const updateRegions = (regions: any) => {
  socket.emit("update-regions", regions)
}

export const closeSocket = () => {
  socket.close()
}
