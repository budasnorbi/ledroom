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

  const setBPM = useStore(useCallback((state) => state.setBPM, []))
  const setBeatOffset = useStore(useCallback((state) => state.setBeatOffset, []))
  const setBeatEndTime = useStore(useCallback((state) => state.setBeatEndTime, []))

  const bpm = useStore((state) => state.bpm)
  const beatOffset = useStore((state) => state.beatOffset)
  const beatEndTime = useStore((state) => state.beatEndTime)

  const wavesurferIsPlaying = useStore((state) => state.wavesurferIsPlaying)
  const wavesurferReady = useStore((state) => state.wavesurferReady)

  const selectedRegion: Region | null = useStore((state) => {
    return state.regions.filter((region) => region.id === state.selectedRegion)[0] ?? null
  })

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

  const handleBPM = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.valueAsNumber
    if (!isNaN(value)) {
      setBPM(event.target.valueAsNumber)
    }
  }

  const handleBeatOffset = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.valueAsNumber
    if (!isNaN(value)) {
      setBeatOffset(value)
    } else {
      setBeatOffset(0)
    }
  }

  const handleBeatEndTime = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.valueAsNumber
    if (!isNaN(value)) {
      setBeatEndTime(event.target.valueAsNumber)
    }
  }

  const handleBeatRender = () => {
    const wavesurfer = wavesurferRef.current
    if (wavesurfer) {
      wavesurfer.regions.destroy()
      const beatInterval = 1 / (bpm / 60)
      const beatOccurences = Math.trunc(wavesurfer.getDuration() / beatInterval)

      for (let i = 0; i < beatOccurences; i++) {
        if (beatInterval * i + beatOffset > beatEndTime && i % 4 === 0) {
          break
        }
        const region = wavesurfer.regions.add({
          id: i.toString(),
          start: i * beatInterval + beatOffset,
          end: i * beatInterval + beatInterval + beatOffset,
          drag: false,
          color: "rgba(0,0,0,0)",
          resize: false
        })

        region.element.setAttribute("data-rangetype", "bpm-range")

        const tempoDiv = document.createElement("div")
        tempoDiv.id = `tempoDiv-${i}`
        tempoDiv.textContent = `${(i + 1) % 4 === 0 ? 4 : (i + 1) % 4}`
        tempoDiv.className = "bpm-range"

        wavesurfer.regions.list[i].element.appendChild(tempoDiv)
      }
    }
  }

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

        <div style={{ display: "flex" }}>
          <div style={{ marginRight: "15px" }}>
            Current Time: {musicCurrentTime ? musicCurrentTime.toPrecision(5) : 0}
          </div>
          <div>
            <span>BPM:</span>
            <input type="number" value={bpm} onChange={handleBPM} />
          </div>
          <div>
            <span>Beat offset:</span>
            <input type="number" value={beatOffset} onChange={handleBeatOffset} />
          </div>
          <div>
            <span>Beat around end:</span>
            <input type="number" value={beatEndTime} onChange={handleBeatEndTime} />
          </div>
          <button disabled={bpm <= 0 || beatEndTime <= 0} onClick={handleBeatRender}>
            Render Beat Regions
          </button>
        </div>
      </div>
      <div className="editorContainer">
        <div className="editorPanel">
          {selectedRegion && (
            <>
              <div style={{ display: "flex" }}>
                <div>
                  Time range: {selectedRegion.startTime.toPrecision(5)} -{" "}
                  {selectedRegion.endTime.toPrecision(5)}
                </div>
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
