import { EffectRegion } from "@type/store"
import { MutableRefObject } from "react"
import { Region } from "wavesurfer.js/src/plugin/regions"
import { clamp } from "./clamp"
import { v4 as uuid } from "uuid"
import { renderIntervalRegions } from "./renderIntervalRegions"

export const renderBeatRegions = (
  wavesurferRef: MutableRefObject<WaveSurfer | null>,
  { bpm, beatOffset, beatAroundEnd }: { bpm: number; beatOffset: number; beatAroundEnd: number },
  {
    addRegion,
    updateRegionTime
  }: {
    addRegion: (config: EffectRegion) => void
    updateRegionTime: (options: { startTime?: number; endTime?: number }) => void
  },
  regions: EffectRegion[]
) => {
  const wavesurfer = wavesurferRef.current as WaveSurfer

  if (wavesurfer) {
    wavesurfer.regions.destroy()
    const beatInterval = 1 / (bpm / 60)
    const beatOccurences = Math.trunc(wavesurfer.getDuration() / beatInterval)

    const lastRegionEndTime = renderIntervalRegions(
      wavesurfer,
      beatOccurences,
      beatInterval,
      beatOffset,
      beatAroundEnd
    )

    let handleType: undefined | "both" | "left" | "right"
    let leftHandleInitValue: number
    let rightHandleInitValue: number

    const regiondblClick = (region: Region) => {
      if (region.element.getAttribute("data-rangetype") === "effect-range") {
        return
      }

      const id = uuid()

      addRegion({
        id,
        startTime: region.start,
        endTime: region.end
        //effects: []
      })

      /* @ts-ignore */
      const effectRegion = wavesurfer.regions.add({
        id,
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

    for (const region of regions) {
      console.log(region)
      const effectRegion = wavesurfer.regions.add({
        id: region.id,
        start: region.startTime,
        end: region.endTime,
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

    wavesurfer.un("region-dblclick", regiondblClick)
    wavesurfer.un("region-update-end", regionUpdateEnd)
    wavesurfer.on("region-dblclick", regiondblClick)
    wavesurfer.on("region-update-end", regionUpdateEnd)
  }
}
