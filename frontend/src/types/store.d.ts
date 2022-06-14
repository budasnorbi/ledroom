export interface Region {
  id: number
  startTime: number
  endTime: number
  bezierValues: [number, number, number, number]
}

export interface Store {
  wavesurferReady: boolean
  wavesurferPlayPause: boolean
  regions: Region[]
  beatInterval: number
  beatEndTime: number
  beatOffset: number
  duration: number
  selectedRegion: number
  setDuration: (duration: number) => void
  setWavesurferReady: (ready: boolean) => void
  setWavesurferPlayPause: () => void
  createRegion: (region: Region) => void
  updateRegion: (options: Partial<Exclude<Region, "id">>) => void
  selectRegion: (id: number) => void
  resetStore: () => void
}
