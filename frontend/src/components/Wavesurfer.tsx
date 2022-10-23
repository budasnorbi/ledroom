import { useEffect, FC, useMemo } from "react"
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

import { renderRegions } from "@utils/renderRegions"
import * as socketApi from "@api/socket"

// let handleSpacePress: any

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

  const _selectedSong = useStore((state) => {
    const song = state.songs.filter((song) => song.id === state.selectedSongId)[0]
    const regions = state.regions.filter((region) => region.songId === state.selectedSongId)
    return {
      song,
      regions
    }
  })

  const selectedSong = useMemo(() => _selectedSong, [selectedSongId])

  useEffect(() => {
    const { beatAroundEnd, beatOffset, bpm, lastTimePosition, volume } = selectedSong.song

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

    wavesurfer.on("play", () => {
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

    wavesurfer.on("ready", () => {
      wavesurfer.zoom(200)

      const progress = lastTimePosition / wavesurfer.getDuration()
      wavesurfer.seekAndCenter(progress)
      wavesurfer.setVolume(volume)

      /* if (!handleSpacePress) {
          handleSpacePress = async (event: KeyboardEvent) => {
            if (event.code !== "Space") {
              return
            }

            ;(wavesurferRef.current as Wavesurfer).playPause()
          }
        }

        window.removeEventListener("keydown", handleSpacePress)
        window.addEventListener("keydown", handleSpacePress) */

      renderRegions(
        wavesurfer,
        {
          beatAroundEnd,
          beatOffset,
          bpm,
          songId: selectedSong.song.id,
          selectedRegionId: selectedSong.song.selectedRegionId
        },
        {
          addRegion,
          updateRegionTime,
          selectRegion
        },
        selectedSong.regions
      )

      updateWavesurferReady(true)
    })

    wavesurfer.load(
      `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN_FROM_PUBLIC}/song/${selectedSong.song.id}`
    )

    return () => {
      wavesurfer.unAll()
      wavesurferRef.current?.destroy()
    }
  }, [
    selectedSong,
    wavesurferRef,
    addRegion,
    selectRegion,
    setMusicCurrentTime,
    toggleWavesurferIsPlaying,
    updateLastTimePosition,
    updateRegionTime,
    updateWavesurferReady
  ])

  return (
    <div>
      <div id="wavesurfer-container"></div>
      <div id="wave-timeline"></div>
    </div>
  )
}

export default WaveSurfer
