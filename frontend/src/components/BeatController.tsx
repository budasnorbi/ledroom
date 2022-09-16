import { ChangeEvent, FC, useEffect, useState } from "react"

import { useStore } from "@store"

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

  useEffect(() => {
    if ((selectedSong?.id || selectedSong?.id === 0) && wavesurferReady) {
      setSongBeatConfig({
        bpm: selectedSong.bpm,
        beatAroundEnd: selectedSong.beatAroundEnd,
        beatOffset: selectedSong.beatOffset
      })
    }
  }, [selectedSong?.id, wavesurferReady])

  if (!selectedSong || !wavesurferReady) {
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
    updateSongBeatConfig(bpm, beatOffset, beatAroundEnd, wavesurferRef)
  }

  const isRenderButtonDisabled =
    songBeatConfig.bpm <= 0 ||
    songBeatConfig.beatAroundEnd <= 0 ||
    songBeatConfig.beatOffset < 0 ||
    (songBeatConfig.bpm === selectedSong.bpm &&
      songBeatConfig.beatAroundEnd === selectedSong.beatAroundEnd &&
      songBeatConfig.beatOffset === selectedSong.beatOffset)

  return (
    <div className="flex items-center">
      <div className="flex items-center mr-2">
        <label htmlFor="suggested-bpm" className="mr-2">
          BPM
        </label>
        <input
          id="suggested-bpm"
          type="number"
          value={songBeatConfig.bpm}
          onChange={handleBPM}
          className="w-16 border-solid rounded-md border-2 text-center"
        />
      </div>
      <div className="flex items-center mr-2">
        <label htmlFor="suggested-beat-offset" className="mr-2">
          Offset
        </label>
        <input
          id="suggested-beat-offset"
          type="number"
          value={songBeatConfig.beatOffset}
          onChange={handleBeatOffset}
          className="w-28 border-solid rounded-md border-2 text-center"
        />
      </div>
      <div className="flex items-center mr-2">
        <label htmlFor="suggested-beat-around-end" className="mr-2">
          Around end
        </label>
        <input
          id="suggested-beat-around-end"
          type="number"
          value={songBeatConfig.beatAroundEnd}
          onChange={handleBeatEndTime}
          className="w-28 border-solid rounded-md border-2 text-center"
        />
      </div>
      <button
        onClick={handleRenderBeats}
        disabled={isRenderButtonDisabled}
        className="py-1 px-2 text-blue-600/100 hover:bg-slate-200 hover:cursor-pointer bg-slate-100 border-slate-50 rounded-md"
      >
        Render beats
      </button>
    </div>
  )
}
