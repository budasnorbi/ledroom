import WaveSurfer from "wavesurfer.js/src/wavesurfer"
import { clamp } from "./clamp"
import { api } from "@api/web"
import { Methods } from "@type/api"

import type { AddRegionResponse, UpdateRegiongResponse } from "@backend/endpoints"
import type { AddRegion, SelectRegion, UpdateRegionTime } from "@type/store"
import type { UpdateRegionSchema, AddRegionSchema } from "@backend/region.yup"
import type { DBRegion } from "@backend/db-entities"
import type { Region } from "wavesurfer.js/src/plugin/regions"

export const renderBeatRegions = (
  wavesurfer: WaveSurfer,
  {
    bpm,
    beatOffset,
    beatAroundEnd,
    songId,
    selectedRegionId
  }: {
    bpm: number
    beatOffset: number
    beatAroundEnd: number
    songId: number
    selectedRegionId?: string | null
  },
  {
    addRegion,
    updateRegionTime,
    selectRegion
  }: {
    addRegion: AddRegion
    updateRegionTime: UpdateRegionTime
    selectRegion: SelectRegion
  },
  regions?: DBRegion[]
) => {
  wavesurfer.regions.clear()
  wavesurfer.regions.unAll()

  const beatInterval = 1 / (bpm / 60)
  const beatOccurences = Math.trunc(wavesurfer.getDuration() / beatInterval)
  let lastRegionEndTime = 0

  for (let i = 0; i < beatOccurences; i++) {
    if (beatInterval * i + beatOffset > beatAroundEnd && i % 4 === 0) {
      lastRegionEndTime = (i - 1) * beatInterval + beatInterval + beatOffset
      break
    }
  }

  let handleType: undefined | "both" | "left" | "right"
  let leftHandleInitValue = 0
  let rightHandleInitValue = 0

  const bothRangeDown = (region: Region) => {
    leftHandleInitValue = region.start
    rightHandleInitValue = region.end

    if (!handleType) {
      handleType = "both"
    }
  }

  const leftRangeDown = () => {
    if (!handleType) {
      handleType = "left"
    }
  }

  const rightRangeDown = () => {
    if (!handleType) {
      handleType = "right"
    }
  }

  const handleRangeClick = (region: Region) => {
    selectRegion(region, wavesurfer)
  }

  const handleUpdateEnd = async (region: Region) => {
    let startTime = 0
    let endTime = 0

    switch (handleType) {
      case "both": {
        const regionWidth = rightHandleInitValue - leftHandleInitValue

        startTime = clamp(
          Math.round((region.start - beatOffset) / beatInterval) * beatInterval + beatOffset,
          beatOffset,
          lastRegionEndTime - regionWidth
        )
        endTime = startTime + regionWidth
        break
      }
      case "left": {
        startTime = clamp(
          Math.round((region.start - beatOffset) / beatInterval) * beatInterval + beatOffset,
          beatOffset,
          region.end - beatInterval
        )
        endTime = region.end
        break
      }
      case "right": {
        startTime = region.start
        endTime = clamp(
          Math.round((region.end - beatOffset) / beatInterval) * beatInterval + beatOffset,
          region.start + beatInterval,
          lastRegionEndTime
        )
        break
      }
      default: {
        return
      }
    }

    handleType = undefined

    const effectRegions = Object.values(wavesurfer.regions.list).filter(
      (_region) =>
        _region.element.getAttribute("data-rangetype") === "effect-range" &&
        _region.id !== region.id
    )

    for (const effectRegion of effectRegions) {
      if (
        (effectRegion.start >= startTime && effectRegion.end >= startTime) ||
        (effectRegion.end >= endTime && effectRegion.end >= endTime)
      ) {
        region.update({
          start: leftHandleInitValue,
          end: rightHandleInitValue
        })
        return
      }
    }

    const response = await api<UpdateRegiongResponse, UpdateRegionSchema>(`/region/${region.id}`, {
      method: Methods.PATCH,
      body: {
        songId,
        startTime,
        endTime
      }
    })

    if (response.statusCode !== 204) {
      region.update({
        start: leftHandleInitValue,
        end: rightHandleInitValue
      })
      return
    }

    region.update({
      start: startTime,
      end: endTime
    })

    updateRegionTime({ startTime, endTime, id: region.id })
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

      const response = await api<AddRegionResponse, AddRegionSchema>("/region", {
        method: Methods.POST,
        body: {
          songId,
          startTime,
          endTime
        }
      })

      if (response.statusCode !== 201) {
        return
      }

      const newRegionId = response.data.id

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

      effectRegion.element.addEventListener("mousedown", () => bothRangeDown(effectRegion))
      effectRegion.handleLeftEl?.addEventListener("mousedown", leftRangeDown)
      effectRegion.handleRightEl?.addEventListener("mousedown", rightRangeDown)
      effectRegion.on("click", () => handleRangeClick(effectRegion))
      effectRegion.on("update-end", () => handleUpdateEnd(effectRegion))
    })
  }

  if (regions) {
    for (const region of regions) {
      let color = "rgba(0,0,255,.15)"

      if (selectedRegionId && selectedRegionId === region.id) {
        color = "rgba(255,0,0,.15)"
      }

      const effectRegion = wavesurfer.regions.add({
        id: region.id,
        start: region.startTime,
        end: region.endTime,
        drag: true,
        color,
        resize: true
      })

      effectRegion.element.setAttribute("data-rangetype", "effect-range")

      effectRegion.element.addEventListener("mousedown", () => bothRangeDown(effectRegion))
      effectRegion.handleLeftEl?.addEventListener("mousedown", leftRangeDown)
      effectRegion.handleRightEl?.addEventListener("mousedown", rightRangeDown)
      effectRegion.on("click", () => handleRangeClick(effectRegion))
      effectRegion.on("update-end", () => handleUpdateEnd(effectRegion))
    }
  }
}
