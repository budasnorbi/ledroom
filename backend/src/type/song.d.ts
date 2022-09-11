export interface Region {
  id: string
  startTime: number
  endTime: number
}

export interface Song {
  id: number
  bpm: number
  beatOffset: number
  beatAroundEnd: number
  name: string
  selectedRegionId: string
  lastTimePosition: number
  volume: number
  regions: Region[]
}
