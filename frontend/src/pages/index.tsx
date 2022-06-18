/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useRef, useState } from "react"
import { sendReset } from "@utils/socket"

import dynamic from "next/dynamic"
import { useStore } from "@utils/store"
import { BezierCurveEditor } from "react-bezier-curve-editor"
import { Region } from "@type/store"

const Preview = dynamic(() => import("../components/Preview"), {
  ssr: false
})

const WaveSurfer = dynamic(() => import("../components/Wavesurfer"), {
  ssr: false
})

let bezierChangeTimeout: any

function Dashboard(props: any) {
  const updateRegion = useStore(useCallback((state) => state.updateRegion, []))
  const resetStore = useStore(useCallback((state) => state.resetStore, []))

  const selectedRegion: Region | null = useStore((state) => {
    return state.regions.filter((region) => region.id === state.selectedRegion)[0] ?? null
  })

  const [bezierValues, setBezierValues] = useState<any>(selectedRegion?.bezierValues)

  useEffect(() => {
    return () => {
      resetStore()
      sendReset()
    }
  }, [])

  useEffect(() => {
    if (selectedRegion?.id) {
      setBezierValues(selectedRegion.bezierValues)
    }
  }, [selectedRegion?.bezierValues])

  const handleBezierUpdate = (values: [number, number, number, number]) => {
    setBezierValues(values)
    if (bezierChangeTimeout) {
      clearTimeout(bezierChangeTimeout)
    }

    bezierChangeTimeout = setTimeout(() => {
      updateRegion({ bezierValues: values })
    }, 350)
  }

  return (
    <>
      {/* @ts-ignore */}
      <WaveSurfer />
      <div className="editorContainer">
        <div className="editorPanel">
          {selectedRegion && (
            <>
              <div>
                Time range: {selectedRegion.startTime.toPrecision(5)} -{" "}
                {selectedRegion.endTime.toPrecision(5)}
              </div>
              <div>
                <BezierCurveEditor value={bezierValues} onChange={handleBezierUpdate} />
                <div>
                  <span>Movement effects</span>
                  <select>
                    <option value="">--Please choose an option--</option>
                    <option value="step-effect">step effect</option>
                  </select>
                  <select>
                    <option value="">--Please choose an option--</option>
                    <option value="step-effect">step effect</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
        <div>
          <h2>Led Preview</h2>
          {/* @ts-ignore */}
          <Preview />
        </div>
      </div>
    </>
  )
}

export default Dashboard
