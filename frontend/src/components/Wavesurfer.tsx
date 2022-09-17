import { useEffect, FC, useCallback } from "react"

import Wavesurfer from "wavesurfer.js"
import RegionsPlugin from "wavesurfer.js/src/plugin/regions"
import TimelinePlugin from "wavesurfer.js/src/plugin/timeline"

import { useStore } from "@store"
import {
  formatTimeCallback,
  primaryLabelInterval,
  secondaryLabelInterval,
  timeInterval
} from "@utils/wavesurfer"
import { Song } from "@type/store"
import { renderBeatRegions } from "@utils/renderBeatRegions"
import webApi from "@api/web"

import * as socketApi from "@api/socket"
import { clamp } from "@utils/clamp"
import { useMemo } from "react"

let handleSpacePress: any

interface WaveSurferProps {
  wavesurferRef: React.MutableRefObject<WaveSurfer | null>
  setMusicCurrentTime: React.Dispatch<React.SetStateAction<number>>
  selectedSongId: number
}

const WaveSurfer: FC<WaveSurferProps> = ({
  setMusicCurrentTime,
  wavesurferRef,
  selectedSongId
}) => {
  const toggleWavesurferIsPlaying = useStore.use.toggleWavesurferIsPlaying()
  const updateLastTimePosition = useStore.use.updateLastTimePosition()
  const updateWavesurferReady = useStore.use.updateWavesurferReady()
  const updateRegionTime = useStore.use.updateRegionTime()
  const selectRegion = useStore.use.selectRegion()
  const addRegion = useStore.use.addRegion()

  const _selectedSong = useStore(
    (state) => state.songs.find((song) => song.id === state.selectedSongId) as Song
  )

  const selectedSong = useMemo(() => _selectedSong, [selectedSongId])

  useEffect(() => {
    const { beatAroundEnd, beatOffset, bpm, lastTimePosition, regions, volume } = selectedSong

    const wavesurfer = (wavesurferRef.current = Wavesurfer.create({
      container: "#wavesurfer-container",
      barWidth: 1,
      partialRender: true,
      normalize: true,
      pixelRatio: 1,
      responsive: true,
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
    }))

    setMusicCurrentTime(lastTimePosition)

    wavesurfer.on("play", (...args) => {
      //console.log(args)
      const currTime = wavesurfer.getCurrentTime()
      socketApi.sendStart(currTime)
      toggleWavesurferIsPlaying()
    })

    wavesurfer.on("pause", () => {
      toggleWavesurferIsPlaying()
      socketApi.sendStop()

      // When the songs ends need to reset the last saved time
      if (wavesurfer.getCurrentTime() === wavesurfer.getDuration()) {
        updateLastTimePosition(0)
        wavesurfer.seekAndCenter(0)
      } else {
        updateLastTimePosition(wavesurfer.getCurrentTime())
      }
    })

    wavesurfer.on("seek", () => {
      const currTime = wavesurfer.getCurrentTime()
      socketApi.sendSeek(currTime)
      updateLastTimePosition(wavesurfer.getCurrentTime())
      setMusicCurrentTime(wavesurfer.getCurrentTime())
    })

    wavesurfer.on("audioprocess", (time: number) => {
      socketApi.sendTimeupdate(time)
      setMusicCurrentTime(wavesurfer.getCurrentTime())
    })

    wavesurfer.on(
      "ready",
      /* @ts-ignore */
      () => {
        updateWavesurferReady(true)

        wavesurfer.zoom(200)

        const progress = lastTimePosition / wavesurfer.getDuration()
        wavesurfer.seekAndCenter(progress)
        wavesurfer.setVolume(volume)

        renderBeatRegions(
          wavesurfer,
          {
            beatAroundEnd,
            beatOffset,
            bpm,
            songId: selectedSongId
          },
          {
            addRegion,
            updateRegionTime,
            selectRegion
          }
        )

        const beatInterval = 1 / (bpm / 60)
        const beatOccurences = Math.trunc(wavesurfer.getDuration() / beatInterval)

        let lastRegionEndTime = 0

        for (let i = 0; i < beatOccurences; i++) {
          if (beatInterval * i + beatOffset > beatAroundEnd && i % 4 === 0) {
            lastRegionEndTime = (i - 1) * beatInterval + beatInterval + beatOffset
            break
          }
        }

        let handleType: undefined | "both" | "left" | "right"
        let leftHandleInitValue = 0
        let rightHandleInitValue = 0

        for (const region of regions) {
          const effectRegion = wavesurfer.regions.add({
            id: region.id,
            start: region.startTime,
            end: region.endTime,
            drag: true,
            color: "rgba(0,0,255,.15)",
            resize: true
          })

          effectRegion.element.setAttribute("data-rangetype", "effect-range")

          effectRegion.element.addEventListener("mousedown", () => {
            leftHandleInitValue = effectRegion.start
            rightHandleInitValue = effectRegion.end
            if (!handleType) {
              handleType = "both"
            }
          })

          effectRegion.handleLeftEl?.addEventListener("mousedown", () => {
            if (!handleType) {
              handleType = "left"
            }
          })

          effectRegion.handleRightEl?.addEventListener("mousedown", () => {
            if (!handleType) {
              handleType = "right"
            }
          })

          effectRegion.on("click", () => {
            selectRegion(effectRegion.id)
          })

          effectRegion.on("update-end", async () => {
            if (handleType === "both") {
              const regionWidth = rightHandleInitValue - leftHandleInitValue
              const start = clamp(
                Math.round((effectRegion.start - beatOffset) / beatInterval) * beatInterval +
                  beatOffset,
                beatOffset,
                lastRegionEndTime - regionWidth
              )
              const end = start + regionWidth
              try {
                await webApi.put("/region", {
                  id: effectRegion.id,
                  songId: selectedSongId,
                  startTime: start,
                  endTime: end
                })
              } catch (error) {
                effectRegion.update({
                  start: leftHandleInitValue,
                  end: rightHandleInitValue
                })
                return
              }
              effectRegion.update({
                start,
                end
              })
              updateRegionTime({ startTime: start, endTime: end, id: effectRegion.id })
            }

            if (handleType === "left") {
              const start = clamp(
                Math.round((effectRegion.start - beatOffset) / beatInterval) * beatInterval +
                  beatOffset,
                beatOffset,
                effectRegion.end - beatInterval
              )

              try {
                await webApi.put("/region", {
                  id: effectRegion.id,
                  songId: selectedSongId,
                  startTime: start,
                  endTime: effectRegion.end
                })
              } catch (error) {
                effectRegion.update({
                  start: leftHandleInitValue,
                  end: rightHandleInitValue
                })
                return
              }

              effectRegion.update({
                start
              })

              updateRegionTime({ startTime: start, id: effectRegion.id })
            }

            if (handleType === "right") {
              const end = clamp(
                Math.round((effectRegion.end - beatOffset) / beatInterval) * beatInterval +
                  beatOffset,
                effectRegion.start + beatInterval,
                lastRegionEndTime
              )

              try {
                await webApi.put("/region", {
                  id: effectRegion.id,
                  songId: selectedSongId,
                  startTime: effectRegion.start,
                  endTime: end
                })
              } catch (error) {
                effectRegion.update({
                  start: leftHandleInitValue,
                  end: rightHandleInitValue
                })
                return
              }

              effectRegion.update({
                end
              })

              updateRegionTime({ endTime: end, id: effectRegion.id })
            }

            handleType = undefined
          })
        }

        if (!handleSpacePress) {
          handleSpacePress = async (event: KeyboardEvent) => {
            if (event.code !== "Space") {
              return
            }

            await wavesurfer.playPause()
          }
        }

        window.removeEventListener("keydown", handleSpacePress)
        window.addEventListener("keydown", handleSpacePress)
      }
    )

    wavesurfer.load(
      `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN_FROM_PUBLIC}/api/song/${selectedSongId}`
    )

    return () => {
      wavesurfer.unAll()
      updateWavesurferReady(false)
      wavesurferRef.current?.destroy()
    }
  }, [selectedSong])

  return (
    <div>
      <div id="wavesurfer-container"></div>
      <div id="wave-timeline"></div>
    </div>
  )
}

export default WaveSurfer
