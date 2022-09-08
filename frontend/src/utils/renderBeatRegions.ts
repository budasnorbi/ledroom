import { MutableRefObject } from "react"
import { Region } from "wavesurfer.js/src/plugin/regions"
import { clamp } from "./clamp"

const renderIntervalRegions = (
  wavesurfer: WaveSurfer,
  beatOccurences: number,
  beatInterval: number,
  beatOffset: number,
  beatAroundEndTime: number
): number => {
  let lastRegionEndTime: number
  for (let i = 0; i < beatOccurences; i++) {
    if (beatInterval * i + beatOffset > beatAroundEndTime && i % 4 === 0) {
      lastRegionEndTime = (i - 1) * beatInterval + beatInterval + beatOffset
      break
    }
    const region = wavesurfer.regions.add({
      id: i.toString(),
      start: i * beatInterval + beatOffset,
      end: i * beatInterval + beatInterval + beatOffset,
      drag: false,
      color: "rgba(0,0,0,0)",
      resize: false
    })

    region.element.setAttribute("data-rangetype", "bpm-range")

    const tempoDiv = document.createElement("div")
    tempoDiv.id = `tempoDiv-${i}`
    tempoDiv.textContent = `${(i + 1) % 4 === 0 ? 4 : (i + 1) % 4}`
    tempoDiv.className = "bpm-range"

    wavesurfer.regions.list[i].element.appendChild(tempoDiv)
  }
  /* @ts-ignore */
  return lastRegionEndTime
}

export const renderBeatRegions = (
  wavesurferRef: MutableRefObject<WaveSurfer | null>,
  { bpm, beatOffset, beatAroundEnd }: { bpm: number; beatOffset: number; beatAroundEnd: number },
  {
    addRegion,
    selectRegion,
    updateRegionTime
  }: {
    addRegion: (config: any) => void
    selectRegion: (id: number) => void
    updateRegionTime: (options: any) => void
  }
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
    let effectRegionIndex = 0

    const regiondblClick = (region: Region) => {
      if (region.element.getAttribute("data-rangetype") === "effect-range") {
        return
      }

      const lastIntervalRangeId = (lastRegionEndTime - beatOffset) / beatInterval
      const id = lastIntervalRangeId + effectRegionIndex
      effectRegionIndex++

      addRegion({
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

    wavesurfer.un("region-dblclick", regiondblClick)
    wavesurfer.un("region-update-end", regionUpdateEnd)

    wavesurfer.on("region-dblclick", regiondblClick)
    wavesurfer.on("region-update-end", regionUpdateEnd)
  }
}
