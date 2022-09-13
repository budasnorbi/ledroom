import { EffectRegion } from "@type/store"
import { MutableRefObject } from "react"
import { clamp } from "./clamp"
import { v4 as uuid } from "uuid"
import { api } from "../api/instance"

export const renderBeatRegions = (
  wavesurferRef: MutableRefObject<WaveSurfer | null>,
  {
    bpm,
    beatOffset,
    beatAroundEnd,
    songId
  }: { bpm: number; beatOffset: number; beatAroundEnd: number; songId: number },
  {
    addRegion,
    updateRegionTime,
    selectRegion
  }: {
    addRegion: (config: EffectRegion) => void
    updateRegionTime: (options: { startTime?: number; endTime?: number; id: string }) => void
    selectRegion: (id: string) => void
  }
) => {
  const wavesurfer = wavesurferRef.current as WaveSurfer

  if (!wavesurfer) {
    return
  }

  wavesurfer.regions.clear()

  const beatInterval = 1 / (bpm / 60)
  const beatOccurences = Math.trunc(wavesurfer.getDuration() / beatInterval)

  let lastRegionEndTime: number = 0

  for (let i = 0; i < beatOccurences; i++) {
    if (beatInterval * i + beatOffset > beatAroundEnd && i % 4 === 0) {
      lastRegionEndTime = (i - 1) * beatInterval + beatInterval + beatOffset
      break
    }
  }

  // Generating beat ranges
  for (let i = 0; i < beatOccurences; i++) {
    if (beatInterval * i + beatOffset > beatAroundEnd && i % 4 === 0) {
      break
    }

    const regionId = i.toString()
    const startTime = i * beatInterval + beatOffset
    const endTime = i * beatInterval + beatInterval + beatOffset

    const bpmRegion = wavesurfer.regions.add({
      id: regionId,
      start: startTime,
      end: endTime,
      drag: false,
      color: "rgba(0,0,0,0)",
      resize: false
    })

    bpmRegion.element.setAttribute("data-rangetype", "bpm-range")

    const tempoDiv = document.createElement("div")
    tempoDiv.id = `tempoDiv-${i}`
    tempoDiv.textContent = `${(i + 1) % 4 === 0 ? 4 : (i + 1) % 4}`
    tempoDiv.className = "bpm-range"

    bpmRegion.element.appendChild(tempoDiv)

    let handleType: undefined | "both" | "left" | "right"
    let leftHandleInitValue = 0
    let rightHandleInitValue = 0

    bpmRegion.unAll()

    bpmRegion.on("dblclick", async (event: MouseEvent) => {
      const regionElement = (event.target as HTMLDivElement).parentElement as HTMLUnknownElement
      const regionId = regionElement.getAttribute("data-id")

      if (!regionId) {
        return
      }

      const region = wavesurfer.regions.list[regionId]

      if (region.element.getAttribute("data-rangetype") === "effect-range") {
        return
      }

      const newRegionId = uuid()

      try {
        await api.post("region", {
          id: newRegionId,
          songId,
          startTime,
          endTime
        })
      } catch (error) {
        return
      }

      addRegion({
        id: newRegionId,
        startTime: region.start,
        endTime: region.end
        //effects: []
      })

      const effectRegion = wavesurfer.regions.add({
        id: newRegionId,
        start: startTime,
        end: endTime,
        drag: true,
        color: "rgba(0,0,255,.15)",
        resize: true
      })

      effectRegion.unAll()

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

      effectRegion.on("click", () => {
        selectRegion(newRegionId)
      })

      effectRegion.on("update-end", async () => {
        if (handleType === "both") {
          const regionWidth = rightHandleInitValue - leftHandleInitValue

          const start = clamp(
            Math.round((effectRegion.start - beatOffset) / beatInterval) * beatInterval +
              beatOffset,
            beatOffset,
            lastRegionEndTime - regionWidth
          )
          const end = start + regionWidth

          try {
            await api.put("/region", {
              id: effectRegion.id,
              songId,
              startTime: start,
              endTime: end
            })
          } catch (error) {
            effectRegion.update({
              start: leftHandleInitValue,
              end: rightHandleInitValue
            })
            return
          }

          effectRegion.update({
            start,
            end
          })

          updateRegionTime({ startTime: start, endTime: end, id: effectRegion.id })
        }

        if (handleType === "left") {
          const start = clamp(
            Math.round((effectRegion.start - beatOffset) / beatInterval) * beatInterval +
              beatOffset,
            beatOffset,
            effectRegion.end - beatInterval
          )

          try {
            await api.put("/region", {
              id: effectRegion.id,
              songId,
              startTime: start,
              endTime: effectRegion.end
            })
          } catch (error) {
            effectRegion.update({
              start: leftHandleInitValue,
              end: rightHandleInitValue
            })
            return
          }

          effectRegion.update({
            start
          })

          updateRegionTime({ startTime: start, id: effectRegion.id })
        }

        if (handleType === "right") {
          const end = clamp(
            Math.round((effectRegion.end - beatOffset) / beatInterval) * beatInterval + beatOffset,
            effectRegion.start + beatInterval,
            lastRegionEndTime
          )

          try {
            await api.put("/region", {
              id: effectRegion.id,
              songId,
              startTime: effectRegion.start,
              endTime: end
            })
          } catch (error) {
            effectRegion.update({
              start: leftHandleInitValue,
              end: rightHandleInitValue
            })
            return
          }

          effectRegion.update({
            end
          })

          updateRegionTime({ endTime: end, id: effectRegion.id })
        }

        handleType = undefined
      })
    })
  }
}
