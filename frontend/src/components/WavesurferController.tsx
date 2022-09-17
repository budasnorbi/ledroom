import { FC, memo, MutableRefObject } from "react"

import { useStore } from "@store"
import { Pause, Play } from "./icons/control"
import { Time } from "./icons/time"
import { VolumeOff, VolumeOn } from "./icons/volume"

interface Props {
  wavesurferRef: MutableRefObject<WaveSurfer>
  musicCurrentTime: number
  volume: number
}

const WavesurferController: FC<Props> = memo(({ wavesurferRef, musicCurrentTime, volume }) => {
  const wavesurferIsPlaying = useStore.use.wavesurferIsPlaying()
  const wavesurferReady = useStore.use.wavesurferReady()

  const updateSongVolume = useStore.use.updateSongVolume()

  const handleWavesurferPlaypause = async () => {
    await wavesurferRef.current.playPause()
  }

  const setVolumeUp = () => {
    const newVolume = parseFloat((volume + 0.05).toFixed(2))
    updateSongVolume(newVolume)
    wavesurferRef.current.setVolume(newVolume)
  }

  const setVolumeDown = () => {
    const newVolume = parseFloat((volume - 0.05).toFixed(2))
    updateSongVolume(newVolume)
    wavesurferRef.current.setVolume(newVolume)
  }

  return (
    <div className="flex items-center px-2 py-3">
      <button
        onClick={handleWavesurferPlaypause}
        disabled={!wavesurferReady}
        className="p-2 text-blue-600/100 font-medium hover:bg-slate-200 hover:cursor-pointer bg-slate-100 border-slate-50 rounded-md mr-4"
      >
        {wavesurferIsPlaying ? <Pause /> : <Play />}
      </button>
      <div className="flex items-stretch mr-4">
        <button
          onClick={setVolumeDown}
          disabled={volume === 0}
          className="py-2 px-4 text-blue-600/100 font-medium hover:bg-slate-200 hover:cursor-pointer bg-slate-100 border-slate-50 rounded-tl-lg rounded-bl-lg "
        >
          -
        </button>

        <div className="flex bg-slate-100 px-4 items-center justify-between w-24">
          {volume === 0 ? <VolumeOff /> : <VolumeOn />}
          <span className="ml-1 text-blue-600/75">{((volume / 1) * 100).toFixed(0)}%</span>
        </div>

        <button
          onClick={setVolumeUp}
          disabled={volume === 1}
          className="py-2 px-4 text-blue-600/100 font-medium hover:bg-slate-200 hover:cursor-pointer bg-slate-100 border-slate-50 rounded-tr-lg rounded-br-lg "
        >
          +
        </button>
      </div>
      <div className="flex items-center">
        <Time />
        <span className="ml-2 ">
          {wavesurferIsPlaying ? musicCurrentTime.toFixed(2) : musicCurrentTime.toFixed(8)}s
        </span>
      </div>
    </div>
  )
})

WavesurferController.displayName = "WavesurferController"
export default WavesurferController
