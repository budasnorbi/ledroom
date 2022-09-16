/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useState } from "react"
import dynamic from "next/dynamic"

import { BeatController } from "@components/BeatController"
import { WavesurferController } from "@components/WavesurferController"
import { RegionEffectEditor } from "@components/RegionEffectEditor"
import { SongLoadController } from "@components/SongLoadController"

const Preview = dynamic(() => import("../components/Preview"), {
  ssr: false
})

const WaveSurfer = dynamic(() => import("../components/Wavesurfer"), {
  ssr: false
})

let bezierChangeTimeout: any

function Dashboard(props: any) {
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const [musicCurrentTime, setMusicCurrentTime] = useState(0)

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
    <div>
      <div className="flex justify-between items-center flex-wrap px-2 py-3">
        <SongLoadController />
        <BeatController wavesurferRef={wavesurferRef} />
      </div>

      {/* @ts-ignore */}
      <WaveSurfer wavesurferRef={wavesurferRef} setMusicCurrentTime={setMusicCurrentTime} />
      <WavesurferController wavesurferRef={wavesurferRef} musicCurrentTime={musicCurrentTime} />
      <div className="editorContainer">
        {/* <RegionEffectEditor /> */}
        <div>
          {/*  <h2>Led Preview</h2> */}
          {/* @ts-ignore */}
          {/* <Preview /> */}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
