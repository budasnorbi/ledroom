import { useRef, useEffect, useState, FC, useCallback } from "react"
import Wavesurfer from "wavesurfer.js"
import TimelinePlugin from "wavesurfer.js/src/plugin/timeline"
import RegionsPlugin, { Region } from "wavesurfer.js/src/plugin/regions"

import {
  formatTimeCallback,
  primaryLabelInterval,
  secondaryLabelInterval,
  timeInterval
} from "@utils/wavesurfer"
import { useStore } from "@utils/store"
import { sendSeek, sendStart, sendStop, sendTimeupdate } from "@utils/socket"

interface WaveSurferProps {
  wavesurferRef: React.MutableRefObject<WaveSurfer | null>
  setMusicCurrentTime: React.Dispatch<React.SetStateAction<number>>
}

let wavesurfer: Wavesurfer

const WaveSurfer: FC<WaveSurferProps> = (props) => {
  const wavesurferContainerRef = useRef<WaveSurfer | any>(null)
  // const [zoomLevel, setZoomLevel] = useState(200)

  const toggleWavesurferIsPlaying = useStore(
    useCallback((state) => state.toggleWavesurferIsPlaying, [])
  )
  const setWavesurferReady = useStore(useCallback((state) => state.setWavesurferReady, []))
  const createRegion = useStore(useCallback((state) => state.createRegion, []))
  const updateRegionTime = useStore(useCallback((state) => state.updateRegionTime, []))
  const setDuration = useStore(useCallback((state) => state.setDuration, []))
  const selectRegion = useStore(useCallback((state) => state.selectRegion, []))

  const bpm = useStore(useCallback((state) => state.bpm, []))
  const selectedRegion = useStore((state) => state.selectedRegion)
  const beatEndTime = useStore(useCallback((state) => state.beatEndTime, []))
  const beatOffset = useStore(useCallback((state) => state.beatOffset, []))
  const wavesurferReady = useStore(useCallback((state) => state.wavesurferReady, []))

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
          props.setMusicCurrentTime(currTime)
          toggleWavesurferIsPlaying()
          sendStart(currTime)
        })

        wavesurfer.on("pause", () => {
          toggleWavesurferIsPlaying()
          sendStop()
        })

        wavesurfer.on("finish", () => {
          toggleWavesurferIsPlaying()
        })

        wavesurfer.on("seek", () => {
          const currTime = wavesurfer.getCurrentTime()
          props.setMusicCurrentTime(currTime)
          sendSeek(currTime)
        })

        wavesurfer.on("audioprocess", (time: number) => {
          props.setMusicCurrentTime(time)
          sendTimeupdate(time)
        })

        wavesurfer.once("ready", () => {
          props.wavesurferRef.current = wavesurfer
          setWavesurferReady(true)
          setDuration(wavesurfer.getDuration())

          props.setMusicCurrentTime(wavesurfer.getCurrentTime())
          wavesurfer.zoom(200)
          wavesurfer.setVolume(0.15)
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
            endTime: region.end
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

            updateRegionTime({
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

            if (Math.abs(region.end - selectedRegion.start) >= bpm) {
              updateRegionTime({
                startTime: selectedRegion.start
              })

              region.update({
                start: selectedRegion.start
              })
            } else {
              updateRegionTime({
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
              updateRegionTime({
                startTime: leftHandleLastVal,
                endTime: rightHandleLastVal
              })
              region.update({
                start: leftHandleLastVal,
                end: rightHandleLastVal
              })
              return clearInternals()
            }

            if (Math.abs(region.start - selectedRegion.end) >= bpm) {
              updateRegionTime({
                endTime: selectedRegion.end
              })

              region.update({
                end: selectedRegion.end
              })
            } else {
              updateRegionTime({
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

  return (
    <>
      <div ref={wavesurferContainerRef}></div>
      <div style={{ height: "20px" }} id="wave-timeline"></div>
      <div>
        {/* <button onClick={handleZoomIn}>Zoom in</button>
        <button onClick={handleZoomOut}>Zoom Out</button>
        <button onClick={handleZoomReset}>Reset Zoom</button> */}
      </div>
    </>
  )
}

export default WaveSurfer
