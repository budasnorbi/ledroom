import { useRef, useEffect, useState, FC } from "react"
import Wavesurfer from "wavesurfer.js"
import TimelinePlugin from "wavesurfer.js/src/plugin/timeline"
import RegionsPlugin from "wavesurfer.js/src/plugin/regions"

import {
  formatTimeCallback,
  primaryLabelInterval,
  secondaryLabelInterval,
  timeInterval
} from "@utils/wavesurfer"

interface WaveSurferProps {
  sendStart: (time: number) => void
  sendStop: () => void
  sendSeek: (time: number) => void
  sendTimeupdate: (time: number) => void
  sendReset: () => void
}

const WaveSurfer: FC<WaveSurferProps> = (props) => {
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false)
  const wavesurferContainerRef = useRef<WaveSurfer | any>(null)
  const wavesurferRef = useRef<WaveSurfer>()

  useEffect(() => {
    fetch("/music.mp3")
      .then((response) => response.arrayBuffer())
      .then(async (arrayBuffer) => {
        const wavesurfer = Wavesurfer.create({
          container: wavesurferContainerRef.current,
          barWidth: 1,
          partialRender: true,
          normalize: true,
          pixelRatio: 1,
          plugins: [
            TimelinePlugin.create({
              container: "#wave-timeline",
              formatTimeCallback: formatTimeCallback,
              timeInterval: timeInterval,
              primaryLabelInterval: primaryLabelInterval,
              secondaryLabelInterval: secondaryLabelInterval,
              primaryColor: "blue",
              secondaryColor: "red",
              primaryFontColor: "blue",
              secondaryFontColor: "red"
            }),
            RegionsPlugin.create({})
          ]
        })

        wavesurfer.loadArrayBuffer(arrayBuffer.slice(0))

        wavesurfer.once("ready", () => {
          wavesurfer.zoom(200)
          wavesurfer.setVolume(0)

          wavesurfer.on("play", () => {
            const currTime = wavesurfer.getCurrentTime()
            props.sendStart(currTime)
          })

          wavesurfer.on("pause", () => {
            props.sendStop()
          })

          wavesurfer.on("seek", () => {
            const currTime = wavesurfer.getCurrentTime()
            props.sendSeek(currTime)
          })

          wavesurfer.on("audioprocess", (time: number) => {
            props.sendTimeupdate(time)
          })

          const beatInterval = 1 / (127 / 60)
          const duration = wavesurfer.getDuration()
          const beatOccurences = Math.trunc(duration / beatInterval)

          for (let i = 0; i < beatOccurences; i++) {
            wavesurfer.regions.add({
              id: `${i}`,
              start: i * beatInterval + 0.14858537097840407,
              end: i * beatInterval + beatInterval + 0.14858537097840407,
              drag: false,
              color: "rgba(255,0,0,0)",
              resize: false
            })
          }

          wavesurfer.on("region-click", (x) => {
            console.log(x.start)
          })
        })

        wavesurferRef.current = wavesurfer
      })

    return () => {
      wavesurferRef.current?.destroy()
      setAudioPlaying(false)
    }
  }, [])

  const handlePlayPause = async () => {
    await wavesurferRef.current?.playPause()
    setAudioPlaying((prevState) => !prevState)
  }
  return (
    <>
      <div ref={wavesurferContainerRef}></div>
      <div style={{ height: "20px" }} id="wave-timeline"></div>
      <div>
        <button onClick={handlePlayPause}>{audioPlaying ? "Resume" : "Play"}</button>
      </div>
    </>
  )
}

export default WaveSurfer
