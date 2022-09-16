import { useStore } from "@store"
import { FC } from "react"
import { Pause, Play } from "./icons/control"
import { Time } from "./icons/time"
import { VolumeOff, VolumeOn } from "./icons/volume"

interface Props {
  wavesurferRef: React.MutableRefObject<WaveSurfer | null>
  musicCurrentTime: number
}

export const WavesurferController: FC<Props> = (props) => {
  const selectedSong = useStore((state) =>
    state.songs.find((song) => song.id === state.selectedSongId)
  )
  const wavesurferIsPlaying = useStore.use.wavesurferIsPlaying()
  const wavesurferReady = useStore.use.wavesurferReady()

  const updateSongVolume = useStore.use.updateSongVolume()

  const wavesurfer = props.wavesurferRef.current as WaveSurfer

  if (!wavesurferReady || !selectedSong) {
    return null
  }

  const handleWavesurferPlaypause = async () => {
    await wavesurfer.playPause()
  }

  const setVolumeUp = () => {
    const newVolume = parseFloat((selectedSong.volume + 0.05).toFixed(2))
    updateSongVolume(newVolume)
    wavesurfer.setVolume(newVolume)
  }

  const setVolumeDown = () => {
    const newVolume = parseFloat((selectedSong.volume - 0.05).toFixed(2))
    updateSongVolume(newVolume)
    wavesurfer.setVolume(newVolume)
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
          disabled={selectedSong.volume === 0}
          className="py-2 px-4 text-blue-600/100 font-medium hover:bg-slate-200 hover:cursor-pointer bg-slate-100 border-slate-50 rounded-tl-lg rounded-bl-lg "
        >
          -
        </button>

        <div className="flex bg-slate-100 px-4 items-center justify-between w-24">
          {selectedSong.volume === 0 ? <VolumeOff /> : <VolumeOn />}
          <span className="ml-1 text-blue-600/75">
            {((selectedSong.volume / 1) * 100).toFixed(0)}%
          </span>
        </div>

        <button
          onClick={setVolumeUp}
          disabled={selectedSong.volume === 1}
          className="py-2 px-4 text-blue-600/100 font-medium hover:bg-slate-200 hover:cursor-pointer bg-slate-100 border-slate-50 rounded-tr-lg rounded-br-lg "
        >
          +
        </button>
      </div>
      <div className="flex items-center">
        <Time />
        <span className="ml-2 ">
          {wavesurferIsPlaying
            ? props.musicCurrentTime.toFixed(2)
            : props.musicCurrentTime.toFixed(8)}
          s
        </span>
      </div>
    </div>
  )
}
