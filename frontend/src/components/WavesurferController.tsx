import { useStore } from "@store"
import { FC } from "react"
import * as styles from "@styles/shared"

interface Props {
  wavesurferRef: React.MutableRefObject<WaveSurfer | null>
  musicCurrentTime: number | undefined
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
    <div css={[styles.dFlex]}>
      <button onClick={handleWavesurferPlaypause} disabled={!wavesurferReady}>
        {wavesurferIsPlaying ? "Pause" : "Play"}
      </button>
      <div css={{ marginRight: "15px" }}>
        Current Time: {props.musicCurrentTime ? props.musicCurrentTime.toPrecision(5) : 0}
      </div>
      <button onClick={setVolumeUp} disabled={selectedSong.volume === 1}>
        Volume +
      </button>
      <button onClick={setVolumeDown} disabled={selectedSong.volume === 0}>
        Volume -
      </button>
      <span>Volume {((selectedSong.volume / 1) * 100).toFixed(0)}%</span>
    </div>
  )
}
