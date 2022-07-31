import { clamp } from "@utils/clamp"
import { renderIntervalRegions } from "@utils/renderBeatRegions"
import { sendReset } from "@utils/socket"
import { useStore } from "src/store/store"
import { ChangeEvent, FC, useCallback, useEffect } from "react"
import { Region } from "wavesurfer.js/src/plugin/regions"

interface Props {
  wavesurferRef: React.MutableRefObject<WaveSurfer | null>
  musicCurrentTime: number | undefined
}

export const WavesurferController: FC<Props> = (props) => {
  const wavesurferReady = useStore((state) => state.wavesurferReady)
  const wavesurferIsPlaying = useStore((state) => state.wavesurferIsPlaying)
  const bpm = useStore((state) => state.bpm)
  const beatOffset = useStore((state) => state.beatOffset)
  const beatEndTime = useStore((state) => state.beatEndTime)

  const setBPM = useStore(useCallback((state) => state.setBPM, []))
  const setBeatOffset = useStore(useCallback((state) => state.setBeatOffset, []))
  const setBeatEndTime = useStore(useCallback((state) => state.setBeatEndTime, []))
  const updateRegionTime = useStore(useCallback((state) => state.updateRegionTime, []))
  const setEffectRange = useStore(useCallback((state) => state.setEffectRange, []))
  const createRegion = useStore(useCallback((state) => state.createRegion, []))
  const selectRegion = useStore(useCallback((state) => state.selectRegion, []))

  const handleWavesurferPlaypause = useCallback(async () => {
    if (wavesurferReady) {
      const wavesurfer = props.wavesurferRef.current as WaveSurfer
      await wavesurfer.playPause()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wavesurferReady])

  useEffect(() => {
    return () => {
      sendReset()
    }
  }, [])

  const handleBPM = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.valueAsNumber
    if (!isNaN(value)) {
      setBPM(event.target.valueAsNumber)
    }
  }

  const handleBeatOffset = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.valueAsNumber
    if (!isNaN(value)) {
      setBeatOffset(value)
    } else {
      setBeatOffset(0)
    }
  }

  const handleBeatEndTime = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.valueAsNumber
    if (!isNaN(value)) {
      setBeatEndTime(event.target.valueAsNumber)
    }
  }

  const handleBeatRender = () => {
    const wavesurfer = props.wavesurferRef.current

    if (wavesurfer) {
      wavesurfer.regions.destroy()
      const beatInterval = 1 / (bpm / 60)
      const beatOccurences = Math.trunc(wavesurfer.getDuration() / beatInterval)

      const lastRegionEndTime = renderIntervalRegions(
        wavesurfer,
        beatOccurences,
        beatInterval,
        beatOffset,
        beatEndTime
      )

      let handleType: undefined | "both" | "left" | "right"
      let leftHandleInitValue: number
      let rightHandleInitValue: number
      let effectRegionIndex = 0

      const regiondblClick = (region: Region) => {
        if (region.element.getAttribute("data-rangetype") === "effect-range") {
          return
        }

        const lastIntervalRangeId = (lastRegionEndTime - beatOffset) / beatInterval
        const id = lastIntervalRangeId + effectRegionIndex
        effectRegionIndex++

        createRegion({
          id,
          startTime: region.start,
          endTime: region.end
        })
        selectRegion(id)

        /* @ts-ignore */
        const effectRegion = wavesurfer.regions.add({
          id: id.toString(),
          start: region.start,
          end: region.end,
          drag: true,
          color: "rgba(0,0,255,.15)",
          resize: true
        })

        effectRegion.element.setAttribute("data-rangetype", "effect-range")

        effectRegion.element.addEventListener("mousedown", () => {
          leftHandleInitValue = effectRegion.start
          rightHandleInitValue = effectRegion.end
          if (!handleType) {
            handleType = "both"
          }
        })

        effectRegion.handleLeftEl?.addEventListener("mousedown", () => {
          if (!handleType) {
            handleType = "left"
          }
        })

        effectRegion.handleRightEl?.addEventListener("mousedown", () => {
          if (!handleType) {
            handleType = "right"
          }
        })
      }

      const regionUpdateEnd = (region: Region) => {
        if (handleType === "both") {
          const regionWidth = rightHandleInitValue - leftHandleInitValue
          const start = clamp(
            Math.round((region.start - beatOffset) / beatInterval) * beatInterval + beatOffset,
            beatOffset,
            lastRegionEndTime - regionWidth
          )

          const end = start + regionWidth

          region.update({
            start,
            end
          })

          updateRegionTime({ startTime: start, endTime: end })
        }

        if (handleType === "left") {
          const start = clamp(
            Math.round((region.start - beatOffset) / beatInterval) * beatInterval + beatOffset,
            beatOffset,
            region.end - beatInterval
          )
          region.update({
            start
          })
          updateRegionTime({ startTime: start })
        }

        if (handleType === "right") {
          const end = clamp(
            Math.round((region.end - beatOffset) / beatInterval) * beatInterval + beatOffset,
            region.start + beatInterval,
            lastRegionEndTime
          )
          region.update({
            end
          })

          updateRegionTime({ endTime: end })
        }

        handleType = undefined
      }

      wavesurfer.on("region-dblclick", regiondblClick)
      wavesurfer.on("region-update-end", regionUpdateEnd)
    }
  }

  return (
    <div>
      <button onClick={handleWavesurferPlaypause} disabled={!wavesurferReady}>
        {wavesurferIsPlaying ? "Pause" : "Play"}
      </button>

      <div style={{ display: "flex" }}>
        <div style={{ marginRight: "15px" }}>
          Current Time: {props.musicCurrentTime ? props.musicCurrentTime.toPrecision(5) : 0}
        </div>
        <div>
          <span>BPM:</span>
          <input type="number" value={bpm} onChange={handleBPM} />
        </div>
        <div>
          <span>Beat offset:</span>
          <input type="number" value={beatOffset} onChange={handleBeatOffset} />
        </div>
        <div>
          <span>Beat around end:</span>
          <input type="number" value={beatEndTime} onChange={handleBeatEndTime} />
        </div>
        <button disabled={bpm <= 0 || beatEndTime <= 0} onClick={handleBeatRender}>
          Render Beat Regions
        </button>
      </div>
    </div>
  )
}
