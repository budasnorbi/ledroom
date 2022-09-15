import Wavesurfer from "wavesurfer.js"
import { sendSeek, sendStart, sendStop, sendTimeupdate } from "./socket"
import { EffectRegion, Song } from "@type/store"
import { renderBeatRegions } from "./renderBeatRegions"
import { MutableRefObject } from "react"
import { clamp } from "./clamp"
import { api } from "../api/instance"

export function formatTimeCallback(seconds: number, pxPerSec: number) {
  seconds = Number(seconds)
  var minutes = Math.floor(seconds / 60)
  seconds = seconds % 60

  // fill up seconds with zeroes
  var secondsStr = Math.round(seconds).toString()
  if (pxPerSec >= 25 * 10) {
    secondsStr = seconds.toFixed(2)
  } else if (pxPerSec >= 25 * 1) {
    secondsStr = seconds.toFixed(1)
  }

  if (minutes > 0) {
    if (seconds < 10) {
      secondsStr = "0" + secondsStr
    }
    return `${minutes}:${secondsStr}`
  }
  return secondsStr
}

export function timeInterval(pxPerSec: number) {
  var retval = 1
  if (pxPerSec >= 25 * 100) {
    retval = 0.01
  } else if (pxPerSec >= 25 * 40) {
    retval = 0.025
  } else if (pxPerSec >= 25 * 10) {
    retval = 0.1
  } else if (pxPerSec >= 25 * 4) {
    retval = 0.25
  } else if (pxPerSec >= 25) {
    retval = 1
  } else if (pxPerSec * 5 >= 25) {
    retval = 5
  } else if (pxPerSec * 15 >= 25) {
    retval = 15
  } else {
    retval = Math.ceil(0.5 / pxPerSec) * 60
  }
  return retval
}

export function primaryLabelInterval(pxPerSec: number) {
  var retval = 1
  if (pxPerSec >= 25 * 100) {
    retval = 10
  } else if (pxPerSec >= 25 * 40) {
    retval = 4
  } else if (pxPerSec >= 25 * 10) {
    retval = 10
  } else if (pxPerSec >= 25 * 4) {
    retval = 4
  } else if (pxPerSec >= 25) {
    retval = 1
  } else if (pxPerSec * 5 >= 25) {
    retval = 5
  } else if (pxPerSec * 15 >= 25) {
    retval = 15
  } else {
    retval = Math.ceil(0.5 / pxPerSec) * 60
  }
  return retval
}

export function secondaryLabelInterval(pxPerSec: number) {
  // draw one every 10s as an example
  return Math.floor(10 / timeInterval(pxPerSec))
}

export const onPlay = (wavesurfer: Wavesurfer, toggleWavesurferIsPlaying: () => void) => {
  const currTime = wavesurfer.getCurrentTime()
  sendStart(currTime)
  toggleWavesurferIsPlaying()
}

export const onPause = (
  wavesurfer: Wavesurfer,
  toggleWavesurferIsPlaying: () => void,
  updateLastTimePosition: (time: number) => void
) => {
  toggleWavesurferIsPlaying()
  sendStop()

  // When the songs ends need to reset the last saved time
  if (wavesurfer.getCurrentTime() === wavesurfer.getDuration()) {
    updateLastTimePosition(0)
    wavesurfer.seekAndCenter(0)
  } else {
    updateLastTimePosition(wavesurfer.getCurrentTime())
  }
}

export const onSeek = (wavesurfer: Wavesurfer, updateLastTimePosition: (time: number) => void) => {
  const currTime = wavesurfer.getCurrentTime()
  sendSeek(currTime)
  updateLastTimePosition(wavesurfer.getCurrentTime())
}

export const onAudioProcess = (time: number) => {
  sendTimeupdate(time)
}

export function onReady(
  wavesurferRef: MutableRefObject<WaveSurfer | null>,
  selectedSong: Song,
  updateWavesurferReady: (isReady: boolean) => void,
  addRegion: (config: EffectRegion) => void,
  updateRegionTime: (options: { startTime?: number; endTime?: number; id: string }) => void,
  selectRegion: (id: string) => void
) {
  const wavesurfer = wavesurferRef.current as WaveSurfer

  if (!wavesurfer) {
    return
  }

  const { volume, lastTimePosition, beatAroundEnd, beatOffset, bpm, id } = selectedSong
  updateWavesurferReady(true)

  wavesurfer.zoom(200)

  const progress = lastTimePosition / wavesurfer.getDuration()
  wavesurfer.seekAndCenter(progress)

  wavesurfer.setVolume(volume)

  renderBeatRegions(
    wavesurferRef,
    {
      beatAroundEnd,
      beatOffset,
      bpm,
      songId: id
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

  for (const region of selectedSong.regions) {
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
          Math.round((effectRegion.start - beatOffset) / beatInterval) * beatInterval + beatOffset,
          beatOffset,
          lastRegionEndTime - regionWidth
        )
        const end = start + regionWidth

        try {
          await api.put("/region", {
            id: effectRegion.id,
            songId: selectedSong.id,
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
          Math.round((effectRegion.start - beatOffset) / beatInterval) * beatInterval + beatOffset,
          beatOffset,
          effectRegion.end - beatInterval
        )

        try {
          await api.put("/region", {
            id: effectRegion.id,
            songId: selectedSong.id,
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
          Math.round((effectRegion.end - beatOffset) / beatInterval) * beatInterval + beatOffset,
          effectRegion.start + beatInterval,
          lastRegionEndTime
        )

        try {
          await api.put("/region", {
            id: effectRegion.id,
            songId: selectedSong.id,
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
}
