import Wavesurfer from "wavesurfer.js"
import TimelinePlugin from "wavesurfer.js/src/plugin/timeline"
import RegionsPlugin, { Region } from "wavesurfer.js/src/plugin/regions"
import { sendSeek, sendStart, sendStop, sendTimeupdate } from "./socket"

export let wavesurfer: Wavesurfer

function formatTimeCallback(seconds: number, pxPerSec: number) {
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

function timeInterval(pxPerSec: number) {
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

function primaryLabelInterval(pxPerSec: number) {
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

function secondaryLabelInterval(pxPerSec: number) {
  // draw one every 10s as an example
  return Math.floor(10 / timeInterval(pxPerSec))
}

interface InitFunctions {
  wavesurferRef: React.MutableRefObject<WaveSurfer | null>
  containerRef: React.MutableRefObject<WaveSurfer | null>
  setMusicCurrentTime: React.Dispatch<React.SetStateAction<number>>
  toggleWavesurferIsPlaying: () => void
  setDuration: (duration: number) => void
  setWavesurferReady: (ready: boolean) => void
}

export const initWavesurfer = (
  songUrl: string,
  {
    wavesurferRef,
    containerRef,
    setDuration,
    setMusicCurrentTime,
    toggleWavesurferIsPlaying,
    setWavesurferReady
  }: InitFunctions
) => {
  if (wavesurfer) {
    wavesurfer.destroy()
  }

  wavesurfer = Wavesurfer.create({
    container: containerRef.current as any,
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
  })

  wavesurfer.load(songUrl)

  wavesurfer.on("play", () => {
    const currTime = wavesurfer.getCurrentTime()
    setMusicCurrentTime(currTime)
    sendStart(currTime)
    toggleWavesurferIsPlaying()
  })

  wavesurfer.on("pause", () => {
    toggleWavesurferIsPlaying()
    sendStop()
  })

  // wavesurfer.on("finish", () => {
  //   toggleWavesurferIsPlaying()
  // })

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
    wavesurferRef.current = wavesurfer
    setWavesurferReady(true)
    setDuration(wavesurfer.getDuration())

    setMusicCurrentTime(wavesurfer.getCurrentTime())
    wavesurfer.zoom(200)
    wavesurfer.setVolume(0.15)
  })
}
