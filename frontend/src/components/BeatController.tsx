import { ChangeEvent, FC, useState, memo, MutableRefObject } from "react"

import { useStore } from "@store"
import { Song } from "@type/song"

interface Props extends Pick<Song, "bpm" | "beatOffset" | "beatAroundEnd"> {
  wavesurferRef: MutableRefObject<WaveSurfer>
}

const BeatController: FC<Props> = memo(({ wavesurferRef, bpm, beatAroundEnd, beatOffset }) => {
  const [songBeatConfig, setSongBeatConfig] = useState({
    bpm,
    beatOffset,
    beatAroundEnd
  })

  const updateSongBeatConfig = useStore.use.updateSongBeatConfig()

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
    updateSongBeatConfig(bpm, beatOffset, beatAroundEnd, wavesurferRef.current)
  }

  const isRenderButtonDisabled =
    songBeatConfig.bpm <= 0 ||
    songBeatConfig.beatAroundEnd <= 0 ||
    songBeatConfig.beatOffset < 0 ||
    (songBeatConfig.bpm === bpm &&
      songBeatConfig.beatAroundEnd === beatAroundEnd &&
      songBeatConfig.beatOffset === beatOffset)

  return (
    <div className="flex items-center ml-auto">
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
        className="py-1 px-2 text-blue-600/100 hover:bg-slate-200 hover:cursor-pointer bg-slate-100 border-slate-50 rounded-md disabled:opacity-50 disabled:cursor-no-drop"
      >
        Render beats
      </button>
    </div>
  )
})

BeatController.displayName = "BeatController"
export default BeatController
