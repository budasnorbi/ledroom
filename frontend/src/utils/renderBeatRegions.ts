export const renderIntervalRegions = (
  wavesurfer: WaveSurfer,
  beatOccurences: number,
  beatInterval: number,
  beatOffset: number,
  beatEndTime: number
): number => {
  let lastRegionEndTime: number
  for (let i = 0; i < beatOccurences; i++) {
    if (beatInterval * i + beatOffset > beatEndTime && i % 4 === 0) {
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
