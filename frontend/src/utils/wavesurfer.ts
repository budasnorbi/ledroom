import Wavesurfer from "wavesurfer.js"
import { sendSeek, sendStart, sendStop, sendTimeupdate } from "./socket"
import { EffectRegion, Song, Store, WavesurferSlice } from "@type/store"
import { renderBeatRegions } from "./renderBeatRegions"

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

export const onPlay = (
  wavesurfer: Wavesurfer,
  toggleWavesurferIsPlaying: () => void,
  updateLastTimePosition: (time: number) => void
) => {
  const currTime = wavesurfer.getCurrentTime()
  //setMusicCurrentTime(currTime)
  sendStart(currTime)
  toggleWavesurferIsPlaying()
  updateLastTimePosition(wavesurfer.getCurrentTime())
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
  //setMusicCurrentTime(time)
  sendTimeupdate(time)
}

export function onReady(
  wavesurfer: Wavesurfer,
  selectedSong: Song,
  updateWavesurferReady: (isReady: boolean) => void,
  addRegion: (config: EffectRegion) => void,
  updateRegionTime: (options: { startTime?: number; endTime?: number; id: string }) => void,
  selectRegion: (id: string) => void
) {
  const { volume, lastTimePosition, beatAroundEnd, beatOffset, bpm, id } = selectedSong
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
      songId: id
    },
    {
      addRegion,
      updateRegionTime,
      selectRegion
    }
  )
}
