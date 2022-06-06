import { useRef, useEffect, useState, FC } from "react"
import Wavesurfer from "wavesurfer.js"
import TimelinePlugin from "wavesurfer.js/src/plugin/timeline"
import RegionsPlugin, { Region } from "wavesurfer.js/src/plugin/regions"

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
          wavesurfer.setVolume(0.15)

          wavesurfer.on("play", () => {
            const currTime = wavesurfer.getCurrentTime()
            props.sendStart(currTime)
          })

          wavesurfer.on("pause", () => {
            props.sendStop()
          })

          wavesurfer.on("seek", () => {
            const currTime = wavesurfer.getCurrentTime()
            //console.log(currTime)
            props.sendSeek(currTime)
          })

          wavesurfer.on("audioprocess", (time: number) => {
            props.sendTimeupdate(time)
          })

          const beatInterval = 1 / (127 / 60)
          const beatOffset = 0.14858537097840407
          const duration = wavesurfer.getDuration()
          const beatOccurences = Math.trunc(duration / beatInterval)

          const startTimes: number[] = []
          const endTimes: number[] = []

          for (let i = 0; i < beatOccurences; i++) {
            startTimes.push(i * beatInterval + beatOffset)
            endTimes.push(i * beatInterval + beatInterval + beatOffset)

            const region = wavesurfer.regions.add({
              id: `${i}`,
              start: i * beatInterval + beatOffset,
              end: i * beatInterval + beatInterval + beatOffset,
              drag: false,
              color: "rgba(0,0,0,0)",
              resize: false
            })

            region.element.setAttribute("data-rangetype", "bpm-range")

            const tempoDiv = document.createElement("div")
            tempoDiv.textContent = `${(i + 1) % 4 === 0 ? 4 : (i + 1) % 4}`
            tempoDiv.style.height = "100%"
            tempoDiv.style.width = "100%"
            tempoDiv.style.display = "flex"
            tempoDiv.style.alignItems = "center"
            tempoDiv.style.justifyContent = "center"
            if (i === 0) {
              tempoDiv.style.borderLeft = "dashed 1px rgba(0,0,0,.5)"
            }
            tempoDiv.style.borderRight = "dashed 1px rgba(0,0,0,.5)"

            wavesurfer.regions.list[i].element.appendChild(tempoDiv)
          }

          let handleType: undefined | "left" | "right"
          let leftHandleLastVal: undefined | number
          let rightHandleLastVal: undefined | number

          wavesurfer.on("region-dblclick", (x) => {
            const id =
              Object.keys(wavesurfer.regions.list)
                .map((x) => parseInt(x))
                .sort((a, b) => b - a)[0] + 1

            const region = wavesurfer.regions.add({
              id: id.toString(),
              start: x.start,
              end: x.end,
              drag: true,
              color: "rgba(0,0,255,.15)",
              resize: true
            })

            region.element.addEventListener("mousedown", () => {
              leftHandleLastVal = region.start
              rightHandleLastVal = region.end
            })

            region.handleLeftEl?.addEventListener("mousedown", () => {
              leftHandleLastVal = region.start
              handleType = "left"
            })

            region.handleRightEl?.addEventListener("mousedown", () => {
              rightHandleLastVal = region.end
              handleType = "right"
            })
          })

          let mouseInRegionStart: undefined | number
          let mouseInRegionEnd: undefined | number

          const clearInternals = () => {
            handleType = undefined
            mouseInRegionStart = undefined
            mouseInRegionEnd = undefined
            leftHandleLastVal = undefined
            rightHandleLastVal = undefined
          }

          wavesurfer.on("region-updated", (region: Region) => {
            mouseInRegionStart = region.start
            mouseInRegionEnd = region.end
          })

          wavesurfer.on("region-update-end", (region: Region) => {
            if (
              region.start < beatOffset ||
              region.end < beatOffset ||
              !mouseInRegionEnd ||
              !mouseInRegionStart ||
              !leftHandleLastVal ||
              !rightHandleLastVal
            ) {
              region.update({
                start: leftHandleLastVal,
                end: rightHandleLastVal
              })
              return clearInternals()
            }

            // drag used
            if (!handleType) {
              const selectedRegion = Object.values(wavesurfer.regions.list).find(
                (region) =>
                  (mouseInRegionStart as number) >= region.start &&
                  (mouseInRegionStart as number) < region.end
              )

              if (!selectedRegion) {
                region.update({
                  start: leftHandleLastVal,
                  end: rightHandleLastVal
                })
                return clearInternals()
              }

              region.update({
                start: selectedRegion.start,
                end: region.end - Math.abs(mouseInRegionStart - selectedRegion.start)
              })
              return clearInternals()
            }

            // left handle
            if (handleType === "left" && mouseInRegionStart) {
              const selectedRegion = Object.values(wavesurfer.regions.list).find(
                (region) =>
                  (mouseInRegionStart as number) >= region.start &&
                  (mouseInRegionStart as number) < region.end
              )

              if (!selectedRegion) {
                region.update({
                  start: leftHandleLastVal,
                  end: rightHandleLastVal
                })
                return clearInternals()
              }

              if (Math.abs(region.end - selectedRegion.start) >= beatInterval) {
                region.update({
                  start: selectedRegion.start
                })
              } else {
                console.log("Hiba", leftHandleLastVal)
                region.update({
                  start: leftHandleLastVal
                })
              }

              return clearInternals()
            }

            // right handle
            if (handleType === "right" && mouseInRegionEnd) {
              const selectedRegion = Object.values(wavesurfer.regions.list).find(
                (region) =>
                  (mouseInRegionEnd as number) >= region.start &&
                  (mouseInRegionEnd as number) < region.end
              )

              if (!selectedRegion) {
                region.update({
                  start: leftHandleLastVal,
                  end: rightHandleLastVal
                })
                return clearInternals()
              }

              if (Math.abs(region.start - selectedRegion.end) >= beatInterval) {
                region.update({
                  end: selectedRegion.end
                })
              } else {
                region.update({
                  end: rightHandleLastVal
                })
              }

              return clearInternals()
            }
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
