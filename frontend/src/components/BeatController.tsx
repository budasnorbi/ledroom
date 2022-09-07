import { clamp } from "@utils/clamp"
import { renderBeatRegions } from "@utils/renderBeatRegions"
import { sendReset } from "@utils/socket"
import { useStore } from "@store"
import { ChangeEvent, FC, useCallback, useEffect, useState } from "react"
import { Region } from "wavesurfer.js/src/plugin/regions"
import { api } from "../api/instance"
import { wavesurfer } from "@utils/wavesurfer"

interface Props {
  wavesurferRef: React.MutableRefObject<WaveSurfer | null>
}

export const BeatController: FC<Props> = ({ wavesurferRef }) => {
  const [songBeatConfig, setSongBeatConfig] = useState({ bpm: 0, beatOffset: 0, beatAroundEnd: 0 })

  const selectedSong = useStore((state) =>
    state.songs.find((song) => song.id === state.selectedSongId)
  )
  const updateSongBeatConfig = useStore.use.updateSongBeatConfig()
  const wavesurferReady = useStore.use.wavesurferReady()
  const updateRegionTime = useStore.use.updateRegionTime()
  const createRegion = useStore.use.createRegion()
  const selectRegion = useStore.use.selectRegion()

  useEffect(() => {
    if ((selectedSong?.id || selectedSong?.id === 0) && wavesurferReady) {
      setSongBeatConfig({
        bpm: selectedSong.bpm,
        beatAroundEnd: selectedSong.beatAroundEnd,
        beatOffset: selectedSong.beatOffset
      })
    }
  }, [selectedSong?.id, wavesurferReady])

  if (!selectedSong) {
    return null
  }

  const handleBPM = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.valueAsNumber
    if (!isNaN(value)) {
      setSongBeatConfig((prevState) => ({ ...prevState, bpm: value }))
    }
  }

  const handleBeatOffset = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.valueAsNumber
    if (!isNaN(value)) {
      setSongBeatConfig((prevState) => ({ ...prevState, beatOffset: value }))
    }
  }

  const handleBeatEndTime = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.valueAsNumber
    if (!isNaN(value)) {
      setSongBeatConfig((prevState) => ({ ...prevState, beatAroundEnd: value }))
    }
  }

  const handleRenderBeats = () => {
    const { bpm, beatAroundEnd, beatOffset } = songBeatConfig
    updateSongBeatConfig(bpm, beatOffset, beatAroundEnd)

    renderBeatRegions(
      wavesurferRef,
      {
        bpm,
        beatOffset,
        beatAroundEnd
      },
      {
        createRegion,
        selectRegion,
        updateRegionTime
      }
    )
  }

  const isRenderButtonDisabled =
    songBeatConfig.bpm <= 0 ||
    songBeatConfig.beatAroundEnd <= 0 ||
    songBeatConfig.beatOffset < 0 ||
    (songBeatConfig.bpm === selectedSong.bpm &&
      songBeatConfig.beatAroundEnd === selectedSong.beatAroundEnd &&
      songBeatConfig.beatOffset === selectedSong.beatOffset)

  return (
    <div style={{ display: "flex" }}>
      <div>
        <span>BPM:</span>
        <input type="number" value={songBeatConfig.bpm} onChange={handleBPM} />
      </div>
      <div>
        <span>Beat offset:</span>
        <input type="number" value={songBeatConfig.beatOffset} onChange={handleBeatOffset} />
      </div>
      <div>
        <span>Beat around end:</span>
        <input type="number" value={songBeatConfig.beatAroundEnd} onChange={handleBeatEndTime} />
      </div>
      <button onClick={handleRenderBeats} disabled={isRenderButtonDisabled}>
        Render beats
      </button>
    </div>
  )
}
