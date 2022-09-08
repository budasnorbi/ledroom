import { useRef, useEffect, FC } from "react"

import { useStore } from "@store"
import { initWavesurfer, wavesurfer } from "@utils/wavesurfer"
import { renderBeatRegions } from "@utils/renderBeatRegions"

interface WaveSurferProps {
  wavesurferRef: React.MutableRefObject<WaveSurfer | null>
  setMusicCurrentTime: React.Dispatch<React.SetStateAction<number>>
}

const WaveSurfer: FC<WaveSurferProps> = ({ setMusicCurrentTime, wavesurferRef }) => {
  const wavesurferContainerRef = useRef<WaveSurfer | any>(null)
  // const [zoomLevel, setZoomLevel] = useState(200)

  const selectedSong = useStore((state) =>
    state.songs.find((song) => song.id === state.selectedSongId)
  )
  const toggleWavesurferReady = useStore.use.toggleWavesurferReady()
  const setDuration = useStore.use.setDuration()
  // const selectRegion = useStore.use.selectRegion()
  const fetchSongs = useStore.use.fetchSongs()
  const toggleWavesurferIsPlaying = useStore.use.toggleWavesurferIsPlaying()
  const updateLastTimePosition = useStore.use.updateLastTimePosition()

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
    fetchSongs()

    return () => {
      //wavesurfer.destroy()
    }
  }, [fetchSongs])

  useEffect(() => {
    if (selectedSong?.id || selectedSong?.id === 0) {
      initWavesurfer(
        `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN_FROM_PUBLIC}/api/song?id=${selectedSong?.id}`,
        {
          wavesurferRef,
          containerRef: wavesurferContainerRef,
          setDuration,
          setMusicCurrentTime,
          toggleWavesurferReady,
          toggleWavesurferIsPlaying,
          updateLastTimePosition,
          lastTimePosition: selectedSong.lastTimePosition
        }
      )
    }

    return () => {
      wavesurfer?.destroy()
    }
  }, [
    selectedSong?.id,
    setDuration,
    setMusicCurrentTime,
    toggleWavesurferReady,
    toggleWavesurferIsPlaying,
    updateLastTimePosition,
    wavesurferRef
  ])

  return (
    <div>
      <div ref={wavesurferContainerRef}></div>
      <div css={{ height: "20px" }} id="wave-timeline"></div>
    </div>
  )
}

export default WaveSurfer
