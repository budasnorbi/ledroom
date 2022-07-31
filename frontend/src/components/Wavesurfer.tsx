import {
  useRef,
  useEffect,
  useState,
  FC,
  useCallback,
  ChangeEventHandler,
  ChangeEvent,
  PointerEvent
} from "react"
import Wavesurfer from "wavesurfer.js"
import TimelinePlugin from "wavesurfer.js/src/plugin/timeline"
import RegionsPlugin, { Region } from "wavesurfer.js/src/plugin/regions"

import {
  formatTimeCallback,
  primaryLabelInterval,
  secondaryLabelInterval,
  timeInterval
} from "@utils/wavesurfer"
import { useStore } from "src/store/store"
import { sendSeek, sendStart, sendStop, sendTimeupdate } from "@utils/socket"
import { fetchSongNames } from "@api"
import { SongLoadController } from "./SongLoadController"

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
  const setDuration = useStore(useCallback((state) => state.setDuration, []))
  const selectRegion = useStore(useCallback((state) => state.selectRegion, []))
  const addSongs = useStore(useCallback((state) => state.addSongs, []))
  const updateSelectedSongId = useStore(useCallback((state) => state.updateSelectedSongId, []))

  const selectedSongId = useStore((state) => state.selectedSongId)

  const initWavesurfer = useCallback((songUrl: string) => {
    if (wavesurfer) {
      wavesurfer.destroy()
    }

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

    wavesurfer.load(songUrl)

    wavesurfer.on("play", () => {
      const currTime = wavesurfer.getCurrentTime()
      props.setMusicCurrentTime(currTime)
      sendStart(currTime)
      toggleWavesurferIsPlaying()
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
  }, [])

  /*   useEffect(() => {
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
  }, [wavesurferReady, selectedRegion]) */

  useEffect(() => {
    fetchSongNames().then((data) => {
      if (data && data.length !== 0) {
        addSongs(data)
        updateSelectedSongId(data[0].id)
      }
    })

    return () => {
      if (wavesurfer) {
        wavesurfer.destroy()
      }
    }
  }, [])

  useEffect(() => {
    if (selectedSongId !== -1) {
      initWavesurfer(
        `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN_FROM_PUBLIC}/api/song?id=${selectedSongId}`
      )
    } else {
      if (wavesurfer) {
        wavesurfer.destroy()
      }
    }
  }, [selectedSongId])

  return (
    <>
      <SongLoadController />
      <div>
        <div ref={wavesurferContainerRef}></div>
        <div style={{ height: "20px" }} id="wave-timeline"></div>
      </div>
    </>
  )
}

export default WaveSurfer
