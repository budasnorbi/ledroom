/* eslint-disable react-hooks/exhaustive-deps */
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from "react"
import { sendReset } from "@utils/socket"

import dynamic from "next/dynamic"
import { useStore } from "@utils/store"
import { BezierCurveEditor } from "react-bezier-curve-editor"
import { Effects, Region } from "@type/store"

const Preview = dynamic(() => import("../components/Preview"), {
  ssr: false
})

const WaveSurfer = dynamic(() => import("../components/Wavesurfer"), {
  ssr: false
})

let bezierChangeTimeout: any

function Dashboard(props: any) {
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const [musicCurrentTime, setMusicCurrentTime] = useState<undefined | number>()
  const [selectedEffect, setSelectedEffect] = useState<Effects>("blink")

  const addEffectToRegion = useStore(useCallback((state) => state.addEffectToRegion, []))
  const wavesurferIsPlaying = useStore((state) => state.wavesurferIsPlaying)
  const wavesurferReady = useStore((state) => state.wavesurferReady)

  const selectedRegion: Region | null = useStore((state) => {
    return state.regions.filter((region) => region.id === state.selectedRegion)[0] ?? null
  })

  // const [bezierValues, setBezierValues] = useState<any>(selectedRegion?.bezierValues)

  /*   useEffect(() => {
    if (wavesurferReady) {
      const wavesurfer = wavesurferRef.current as WaveSurfer
    }
  }, [wavesurferReady]) */

  const handleWavesurferPlaypause = useCallback(async () => {
    if (wavesurferReady) {
      const wavesurfer = wavesurferRef.current as WaveSurfer
      await wavesurfer.playPause()
    }
  }, [wavesurferReady])

  useEffect(() => {
    return () => {
      sendReset()
    }
  }, [])

  const handleEffectSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as Effects
    setSelectedEffect(value)
  }

  const handleEffectAdd = useCallback(() => {
    addEffectToRegion(selectedEffect)
  }, [selectedEffect])

  /*   useEffect(() => {
    if (selectedRegion?.id) {
      setBezierValues(selectedRegion.bezierValues)
    }
  }, [selectedRegion?.bezierValues]) */

  /*   const handleBezierUpdate = (values: [number, number, number, number]) => {
    setBezierValues(values)
    if (bezierChangeTimeout) {
      clearTimeout(bezierChangeTimeout)
    }

    bezierChangeTimeout = setTimeout(() => {
      updateRegion({ bezierValues: values })
    }, 350)
  } */
  return (
    <>
      {/* @ts-ignore */}
      <WaveSurfer wavesurferRef={wavesurferRef} setMusicCurrentTime={setMusicCurrentTime} />
      <div>
        <button onClick={handleWavesurferPlaypause} disabled={!wavesurferReady}>
          {wavesurferIsPlaying ? "Pause" : "Play"}
        </button>
        <div>Current Time: {musicCurrentTime ? musicCurrentTime.toPrecision(5) : 0}</div>
      </div>
      <div className="editorContainer">
        <div className="editorPanel">
          {selectedRegion && (
            <>
              <div>
                Time range: {selectedRegion.startTime.toPrecision(5)} -{" "}
                {selectedRegion.endTime.toPrecision(5)}
              </div>
              <div style={{ marginTop: "15px" }}>
                <div>
                  <h2>Effects</h2>
                  <select value={selectedEffect} onChange={handleEffectSelect}>
                    <option value="step">step</option>
                    <option value="blink">blink</option>
                  </select>
                  <button onClick={handleEffectAdd}>add</button>
                </div>
                <div>
                  <h2>Selected effects:</h2>
                </div>
                {/* <BezierCurveEditor value={bezierValues} onChange={handleBezierUpdate} />
                <div>
                  <span>Movement effects</span>
                  
                  <select>
                    <option value="">--Please choose an option--</option>
                    <option value="step-effect">step effect</option>
                  </select>
                </div> */}
              </div>
            </>
          )}
        </div>
        <div>
          {/*  <h2>Led Preview</h2> */}
          {/* @ts-ignore */}
          {/* <Preview /> */}
        </div>
      </div>
    </>
  )
}

export default Dashboard
