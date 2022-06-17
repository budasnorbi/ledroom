import { useRef, useEffect, useState, FC, useCallback } from "react"
import Wavesurfer from "wavesurfer.js"
import TimelinePlugin from "wavesurfer.js/src/plugin/timeline"
import RegionsPlugin, { Region } from "wavesurfer.js/src/plugin/regions"
import MinimapPlugin from "wavesurfer.js/src/plugin/minimap"

import {
  formatTimeCallback,
  primaryLabelInterval,
  secondaryLabelInterval,
  timeInterval
} from "@utils/wavesurfer"
import { number } from "yup"
import { useStore } from "@utils/store"
import { sendSeek, sendStart, sendStop, sendTimeupdate } from "@utils/socket"
import Konva from "konva"
import { Stage } from "konva/lib/Stage"

interface WaveSurferProps {}

let wavesurfer: Wavesurfer

const WaveSurfer: FC<WaveSurferProps> = (props) => {
  const wavesurferContainerRef = useRef<WaveSurfer | any>(null)
  // const [zoomLevel, setZoomLevel] = useState(200)
  const [musicCurrentTime, setMusicCurrentTime] = useState<undefined | number>()

  const setWavesurferPlayPause = useStore(useCallback((state) => state.setWavesurferPlayPause, []))
  const setWavesurferReady = useStore(useCallback((state) => state.setWavesurferReady, []))
  const createRegion = useStore(useCallback((state) => state.createRegion, []))
  const updateRegion = useStore(useCallback((state) => state.updateRegion, []))
  const setDuration = useStore(useCallback((state) => state.setDuration, []))
  const selectRegion = useStore(useCallback((state) => state.selectRegion, []))

  const beatInterval = useStore(useCallback((state) => state.beatInterval, []))
  const selectedRegion = useStore((state) => state.selectedRegion)
  const beatEndTime = useStore(useCallback((state) => state.beatEndTime, []))
  const beatOffset = useStore(useCallback((state) => state.beatOffset, []))
  const duration = useStore(useCallback((state) => state.duration, []))
  const wavesurferReady = useStore(useCallback((state) => state.wavesurferReady, []))
  const wavesurferPlayPause = useStore(useCallback((state) => state.wavesurferPlayPause, []))

  useEffect(() => {
    fetch("/music.mp3")
      .then((response) => response.arrayBuffer())
      .then(async (arrayBuffer) => {
        wavesurfer = Wavesurfer.create({
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

        wavesurfer.on("play", () => {
          const currTime = wavesurfer.getCurrentTime()
          setMusicCurrentTime(currTime)
          sendStart(currTime)
        })

        wavesurfer.on("pause", () => {
          sendStop()
        })

        wavesurfer.on("seek", () => {
          const currTime = wavesurfer.getCurrentTime()
          setMusicCurrentTime(currTime)
          sendSeek(currTime)
        })

        wavesurfer.on("audioprocess", (time: number) => {
          setMusicCurrentTime(time)
          sendTimeupdate(time)
        })

        wavesurfer.once("ready", () => {
          setWavesurferReady(true)
          setDuration(wavesurfer.getDuration())

          setMusicCurrentTime(wavesurfer.getCurrentTime())
          wavesurfer.zoom(200)
          wavesurfer.setVolume(0.15)

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
        })

        let handleType: undefined | "left" | "right"
        let leftHandleLastVal: undefined | number
        let rightHandleLastVal: undefined | number
        let mouseInRegionStart: undefined | number
        let mouseInRegionEnd: undefined | number

        const clearInternals = () => {
          handleType = undefined
          mouseInRegionStart = undefined
          mouseInRegionEnd = undefined
          leftHandleLastVal = undefined
          rightHandleLastVal = undefined
        }

        wavesurfer.on("region-dblclick", (region: Region) => {
          if (region.element.getAttribute("data-rangetype") === "effect-range") {
            return
          }

          const id =
            /* @ts-ignore */
            Object.keys(wavesurfer.regions.list)
              .map((regionKey) => parseInt(regionKey))
              .sort((a, b) => b - a)[0] + 1

          createRegion({
            id,
            startTime: region.start,
            endTime: region.end,
            bezierValues: [0.2, 0.2, 0.8, 0.8]
          })
          selectRegion(id)

          /* @ts-ignore */
          const newRegion = wavesurfer.regions.add({
            id: id.toString(),
            start: region.start,
            end: region.end,
            drag: true,
            color: "rgba(0,0,255,.15)",
            resize: true
          })

          newRegion.element.setAttribute("data-rangetype", "effect-range")

          newRegion.element.addEventListener("mousedown", () => {
            leftHandleLastVal = region.start
            rightHandleLastVal = region.end
          })

          newRegion.handleLeftEl?.addEventListener("mousedown", () => {
            leftHandleLastVal = region.start
            handleType = "left"
          })

          newRegion.handleRightEl?.addEventListener("mousedown", () => {
            rightHandleLastVal = region.end
            handleType = "right"
          })
        })

        wavesurfer.on("region-updated", (region: Region) => {
          mouseInRegionStart = region.start
          mouseInRegionEnd = region.end
        })

        wavesurfer.on("region-update-end", (region: Region) => {
          const regionId = parseInt(region.id)
          if (
            region.start < beatOffset ||
            region.end < beatOffset ||
            !mouseInRegionEnd ||
            !mouseInRegionStart
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

            updateRegion({
              startTime: selectedRegion.start,
              endTime: region.end - Math.abs(mouseInRegionStart - selectedRegion.start)
            })

            region.update({
              start: selectedRegion.start,
              end: region.end - Math.abs(mouseInRegionStart - selectedRegion.start)
            })
            return clearInternals()
          }

          // left handle
          if (handleType === "left" && mouseInRegionStart) {
            /* @ts-ignore */
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
              updateRegion({
                startTime: selectedRegion.start
              })

              region.update({
                start: selectedRegion.start
              })
            } else {
              updateRegion({
                startTime: leftHandleLastVal
              })

              region.update({
                start: leftHandleLastVal
              })
            }

            return clearInternals()
          }

          // right handle
          if (handleType === "right" && mouseInRegionEnd) {
            /* @ts-ignore */
            const selectedRegion = Object.values(wavesurfer.regions.list).find(
              (region) =>
                (mouseInRegionEnd as number) >= region.start &&
                (mouseInRegionEnd as number) < region.end
            )

            if (!selectedRegion) {
              updateRegion({
                startTime: leftHandleLastVal,
                endTime: rightHandleLastVal
              })
              region.update({
                start: leftHandleLastVal,
                end: rightHandleLastVal
              })
              return clearInternals()
            }

            if (Math.abs(region.start - selectedRegion.end) >= beatInterval) {
              updateRegion({
                endTime: selectedRegion.end
              })

              region.update({
                end: selectedRegion.end
              })
            } else {
              updateRegion({
                endTime: rightHandleLastVal
              })
              region.update({
                end: rightHandleLastVal
              })
            }

            return clearInternals()
          }
        })
      })

    return () => {
      wavesurfer.unAll()
      wavesurfer.destroy()
    }
  }, [])

  useEffect(() => {
    const handleRegionClick = (region: Region) => {
      if (region.element.getAttribute("data-rangetype") === "effect-range") {
        wavesurfer.setCurrentTime(region.start)
        const regionId = parseInt(region.id)
        if (regionId !== selectedRegion) {
          selectRegion(regionId)
        }
      }
    }

    if (wavesurferReady && wavesurfer) {
      wavesurfer.on("region-click", handleRegionClick)
    }

    return () => wavesurfer.un("region-click", handleRegionClick)
  }, [wavesurferReady, selectedRegion])

  // useEffect(() => {
  //
  //     wavesurfer.current?.zoom(zoomLevel)
  //
  // }, [zoomLevel])

  // const handleZoomIn = () => {
  //   setZoomLevel((prevZoomLevel) => prevZoomLevel + 100)
  // }
  // const handleZoomOut = () => {
  //   setZoomLevel((prevZoomLevel) => prevZoomLevel - 100)
  // }

  // const handleZoomReset = () => {
  //   setZoomLevel((prevZoomLevel) => 200)
  // }

  const handlePlayPause = async () => {
    await wavesurfer.playPause()
    setWavesurferPlayPause()
  }
  return (
    <>
      <div ref={wavesurferContainerRef}></div>
      <div style={{ height: "20px" }} id="wave-timeline"></div>
      <div>
        <button onClick={handlePlayPause}>{wavesurferPlayPause ? "Resume" : "Play"}</button>
        {/* <button onClick={handleZoomIn}>Zoom in</button>
        <button onClick={handleZoomOut}>Zoom Out</button>
        <button onClick={handleZoomReset}>Reset Zoom</button> */}
        <div>Time: {musicCurrentTime ? musicCurrentTime.toPrecision(5) : 0}</div>
      </div>
    </>
  )
}

export default WaveSurfer
