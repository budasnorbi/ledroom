import { useStore } from "@store"
import { FC, useCallback } from "react"
import { css } from "@emotion/react"
import * as styles from "@styles/shared"

interface Props {
  wavesurferRef: React.MutableRefObject<WaveSurfer | null>
  musicCurrentTime: number | undefined
}

export const WavesurferController: FC<Props> = (props) => {
  const selectedSongId = useStore((state) => state.selectedSongId)
  const wavesurferIsPlaying = useStore.use.wavesurferIsPlaying()
  const wavesurferReady = useStore.use.wavesurferReady()
  const wavesurfer = props.wavesurferRef.current as WaveSurfer

  if (!wavesurferReady || !wavesurfer || selectedSongId === -1) {
    return null
  }

  const handleWavesurferPlaypause = async () => {
    await wavesurfer.playPause()
  }

  const setVolumeUp = () => {
    wavesurfer.setVolume(wavesurfer.getVolume() + 0.1)
  }

  const setVolumeDown = () => {
    wavesurfer.setVolume(wavesurfer.getVolume() - 0.1)
  }

  return (
    <div css={[styles.dFlex]}>
      <button onClick={handleWavesurferPlaypause} disabled={!wavesurferReady}>
        {wavesurferIsPlaying ? "Pause" : "Play"}
      </button>
      <div css={{ marginRight: "15px" }}>
        Current Time: {props.musicCurrentTime ? props.musicCurrentTime.toPrecision(5) : 0}
      </div>
      <button>Volume up</button>
      <button>Volume down</button>
      <span>Volume {wavesurfer.getVolume()}</span>
    </div>
  )
}
