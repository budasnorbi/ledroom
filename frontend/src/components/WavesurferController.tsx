import { useStore } from "@store"
import { FC, useCallback } from "react"

interface Props {
  wavesurferRef: React.MutableRefObject<WaveSurfer | null>
  musicCurrentTime: number | undefined
}

export const WavesurferController: FC<Props> = (props) => {
  const wavesurferIsPlaying = useStore.use.wavesurferIsPlaying()
  const wavesurferReady = useStore.use.wavesurferReady()

  const handleWavesurferPlaypause = useCallback(async () => {
    if (wavesurferReady) {
      const wavesurfer = props.wavesurferRef.current as WaveSurfer
      await wavesurfer.playPause()
    }
  }, [props.wavesurferRef, wavesurferReady])

  return (
    <div style={{ display: "flex" }}>
      <button onClick={handleWavesurferPlaypause} disabled={!wavesurferReady}>
        {wavesurferIsPlaying ? "Pause" : "Play"}
      </button>
      <div style={{ marginRight: "15px" }}>
        Current Time: {props.musicCurrentTime ? props.musicCurrentTime.toPrecision(5) : 0}
      </div>
      <button>Volume up</button>
      <button>Volume down</button>
    </div>
  )
}
