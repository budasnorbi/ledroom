import WaveSurfer from "wavesurfer.js/src/wavesurfer"
import { nanoid } from "nanoid"

import { clamp } from "./clamp"
import api from "@api/web"
import { AddRegionResponse, UpdateRegiongResponse } from "@backend/endpoints"
import { AddRegion, SelectRegion, SongsSlice, UpdateRegionTime } from "@type/store"
//import type {} from "@backend"

export const renderBeatRegions = (
  wavesurfer: WaveSurfer,
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
    addRegion: AddRegion
    updateRegionTime: UpdateRegionTime
    selectRegion: SelectRegion
  }
) => {
  wavesurfer.regions.clear()

  const beatInterval = 1 / (bpm / 60)
  const beatOccurences = Math.trunc(wavesurfer.getDuration() / beatInterval)
  let lastRegionEndTime = 0

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

      const newRegionId = nanoid()

      const response = await api.post<AddRegionResponse>("/region", {
        id: newRegionId,
        songId,
        startTime,
        endTime
      })

      if (!response) {
        return
      }

      addRegion({
        id: newRegionId,
        songId,
        startTime: region.start,
        endTime: region.end,
        name: ""
      })

      const effectRegion = wavesurfer.regions.add({
        id: newRegionId,
        start: startTime,
        end: endTime,
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

      effectRegion.on("click", () => {
        selectRegion(effectRegion.id)
      })

      effectRegion.on("update-end", async () => {
        let startTime = 0
        let endTime = 0

        switch (handleType) {
          case "both": {
            const regionWidth = rightHandleInitValue - leftHandleInitValue

            startTime = clamp(
              Math.round((effectRegion.start - beatOffset) / beatInterval) * beatInterval +
                beatOffset,
              beatOffset,
              lastRegionEndTime - regionWidth
            )
            endTime = startTime + regionWidth
            break
          }
          case "left": {
            startTime = clamp(
              Math.round((effectRegion.start - beatOffset) / beatInterval) * beatInterval +
                beatOffset,
              beatOffset,
              effectRegion.end - beatInterval
            )
            endTime = effectRegion.end
          }
          case "right": {
            startTime = effectRegion.start
            endTime = clamp(
              Math.round((effectRegion.end - beatOffset) / beatInterval) * beatInterval +
                beatOffset,
              effectRegion.start + beatInterval,
              lastRegionEndTime
            )
          }
          default: {
            return
          }
        }

        handleType = undefined

        const response = await api.put<UpdateRegiongResponse>("/region", {
          id: effectRegion.id,
          songId,
          startTime,
          endTime
        })

        if (!response) {
          effectRegion.update({
            start: leftHandleInitValue,
            end: rightHandleInitValue
          })
          return
        }

        effectRegion.update({
          start: startTime,
          end: endTime
        })

        updateRegionTime({ startTime, endTime, id: effectRegion.id })
      })
    })
  }
}
