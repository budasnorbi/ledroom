/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useRef, useState } from "react"

import dynamic from "next/dynamic"
import { io } from "socket.io-client"
import { useStore } from "@utils/store"
import { BezierCurveEditor } from "react-bezier-curve-editor"
import { Region } from "@type/store"

const WaveSurfer = dynamic(() => import("../components/Wavesurfer"), {
  ssr: false
})

const socket = io("http://localhost:3001/")
let bezierChangeTimeout: any

function Dashboard(props: any) {
  const updateRegion = useStore(useCallback((state) => state.updateRegion, []))

  const selectedRegion: Region | null = useStore((state) => {
    return state.regions.filter((region) => region.id === state.selectedRegion)[0] ?? null
  })

  const [bezierValues, setBezierValues] = useState<any>(selectedRegion?.bezierValues)

  useEffect(() => {
    return () => {
      useStore.setState({}, true)
    }
  }, [])

  useEffect(() => {
    if (selectedRegion?.id) {
      setBezierValues(selectedRegion.bezierValues)
    }
  }, [selectedRegion?.bezierValues])

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

  const handleBezierUpdate = (values: [number, number, number, number]) => {
    setBezierValues(values)
    if (bezierChangeTimeout) {
      clearTimeout(bezierChangeTimeout)
    }

    bezierChangeTimeout = setTimeout(() => {
      updateRegion({ bezierValues: values })
    }, 350)
  }

  console.log(selectedRegion)
  return (
    <>
      {/* @ts-ignore */}
      <WaveSurfer
        sendTimeupdate={sendTimeupdate}
        sendStart={sendStart}
        sendStop={sendStop}
        sendSeek={sendSeek}
        sendReset={sendReset}
      />

      {selectedRegion && (
        <div>
          <div>
            Time range: {selectedRegion.startTime.toPrecision(5)} -{" "}
            {selectedRegion.endTime.toPrecision(5)}
          </div>
          <div>
            <BezierCurveEditor value={bezierValues} onChange={handleBezierUpdate} />
            <div>
              <div>
                <h5>Lighting effects</h5>
                <select>
                  <option>blink</option>
                </select>
              </div>
              <div>
                <h5>Movement effects</h5>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Dashboard
