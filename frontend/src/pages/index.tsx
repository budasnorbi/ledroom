import React, { useEffect, useRef } from "react"

import dynamic from "next/dynamic"
import { io } from "socket.io-client"

const WaveSurfer = dynamic(() => import("../components/Wavesurfer"), {
  ssr: false
})

const socket = io("http://localhost:3001/")
function Dashboard(props: any) {
  const sendTimeupdate = (time: number) => {
    socket.emit("timeupdate", time)
  }

  const sendStart = (time: number) => {
    socket.emit("start", time)
  }

  const sendStop = () => {
    socket.emit("stop")
  }

  const sendSeek = (time: number) => {
    socket.emit("seek", time)
  }

  const sendReset = () => {
    socket.emit("reset")
  }

  return (
    <div>
      {/* @ts-ignore */}
      <WaveSurfer
        sendTimeupdate={sendTimeupdate}
        sendStart={sendStart}
        sendStop={sendStop}
        sendSeek={sendSeek}
        sendReset={sendReset}
      />
    </div>
  )
}

export default Dashboard
