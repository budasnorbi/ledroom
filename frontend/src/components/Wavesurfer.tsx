import { useRef, useEffect, FC } from "react"
import Wavesurfer from "wavesurfer.js"
import RegionsPlugin from "wavesurfer.js/src/plugin/regions"
import TimelinePlugin from "wavesurfer.js/src/plugin/timeline"

import { useStore } from "@store"
import {
  formatTimeCallback,
  onAudioProcess,
  onPause,
  onPlay,
  onReady,
  onSeek,
  primaryLabelInterval,
  secondaryLabelInterval,
  timeInterval
} from "@utils/wavesurfer"

let handleSpacePress: any

interface WaveSurferProps {
  wavesurferRef: React.MutableRefObject<WaveSurfer | null>
  setMusicCurrentTime: React.Dispatch<React.SetStateAction<number>>
}

const WaveSurfer: FC<WaveSurferProps> = ({ setMusicCurrentTime, wavesurferRef }) => {
  // const [zoomLevel, setZoomLevel] = useState(200)

  const fetchSongs = useStore.use.fetchSongs()
  const toggleWavesurferIsPlaying = useStore.use.toggleWavesurferIsPlaying()
  const updateLastTimePosition = useStore.use.updateLastTimePosition()
  const updateWavesurferReady = useStore.use.updateWavesurferReady()
  const updateRegionTime = useStore.use.updateRegionTime()
  const selectRegion = useStore.use.selectRegion()
  const addRegion = useStore.use.addRegion()

  const selectedSong = useStore((state) =>
    state.songs.find((song) => song.id === state.selectedSongId)
  )

  useEffect(() => {
    wavesurferRef.current = Wavesurfer.create({
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
    })

    fetchSongs()
  }, [fetchSongs, wavesurferRef])

  useEffect(() => {
    if (selectedSong) {
      if (wavesurferRef.current) {
      }
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

      setMusicCurrentTime(selectedSong.lastTimePosition)

      wavesurfer.unAll()
      wavesurfer.on("audioprocess", () => {
        setMusicCurrentTime(wavesurfer.getCurrentTime())
      })

      wavesurfer.on("seek", () => {
        setMusicCurrentTime(wavesurfer.getCurrentTime())
      })

      wavesurfer.on("play", onPlay.bind(this, wavesurfer, toggleWavesurferIsPlaying))
      wavesurfer.on(
        "pause",
        onPause.bind(this, wavesurfer, toggleWavesurferIsPlaying, updateLastTimePosition)
      )
      wavesurfer.on("seek", onSeek.bind(this, wavesurfer, updateLastTimePosition))
      wavesurfer.on("audioprocess", onAudioProcess)

      wavesurfer.on(
        "ready",
        /* @ts-ignore */
        onReady.bind(
          this,
          wavesurferRef,
          selectedSong,
          updateWavesurferReady,
          addRegion,
          updateRegionTime,
          selectRegion
        )
      )

      if (!handleSpacePress) {
        handleSpacePress = (event: KeyboardEvent) => {
          if (event.code === "Space") {
            wavesurfer.playPause()
          }
        }
      }

      window.removeEventListener("keydown", handleSpacePress)
      window.addEventListener("keydown", handleSpacePress)

      wavesurfer.load(
        `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN_FROM_PUBLIC}/api/song?id=${selectedSong.id}`
      )
    } else {
      const wavesurfer = wavesurferRef.current as WaveSurfer

      if (!wavesurfer) {
        return
      }

      wavesurfer.destroy()
    }

    return () => {
      wavesurferRef.current?.destroy()
    }
  }, [selectedSong?.id])

  return (
    <div>
      <div id="wavesurfer-container"></div>
      <div css={{ height: "20px" }} id="wave-timeline"></div>
    </div>
  )
}

export default WaveSurfer
