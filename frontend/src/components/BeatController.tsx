import { ChangeEvent, FC, useState, memo, MutableRefObject } from "react"

import { useStore } from "@store"
import { DBSong } from "@backend/db-entities"
import { Methods } from "@type/api"
import { api } from "@api/web"
import { BeatConfigResponse } from "@backend/endpoints"
import { UpdateBeatsSchema } from "@backend/song.yup"
import { renderRegions } from "@utils/renderRegions"

interface Props extends Pick<DBSong, "bpm" | "beatOffset" | "beatAroundEnd"> {
  wavesurferRef: MutableRefObject<WaveSurfer>
  selectedSongId: number
}

const BeatController: FC<Props> = memo(
  ({ wavesurferRef, bpm, beatAroundEnd, beatOffset, selectedSongId }) => {
    const [songBeatConfig, setSongBeatConfig] = useState({
      bpm,
      beatOffset,
      beatAroundEnd
    })

    const updateSongBeatConfig = useStore.use.updateSongBeatConfig()
    const addRegion = useStore.use.addRegion()
    const selectRegion = useStore.use.selectRegion()
    const updateRegionTime = useStore.use.updateRegionTime()

    const handleBPM = (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.valueAsNumber
      if (!isNaN(value)) {
        setSongBeatConfig((prevState) => ({ ...prevState, bpm: value }))
      }
    }

    const handleBeatOffset = (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.valueAsNumber
      if (!isNaN(value)) {
        setSongBeatConfig((prevState) => ({ ...prevState, beatOffset: value }))
      }
    }

    const handleBeatEndTime = (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.valueAsNumber
      if (!isNaN(value)) {
        setSongBeatConfig((prevState) => ({ ...prevState, beatAroundEnd: value }))
      }
    }

    const handleRenderBeats = async () => {
      const { bpm, beatAroundEnd, beatOffset } = songBeatConfig

      const response = await api<BeatConfigResponse, UpdateBeatsSchema>(
        `/song/${selectedSongId}/beat-config`,
        {
          method: Methods.PATCH,
          body: {
            bpm,
            beatOffset,
            beatAroundEnd
          }
        }
      )

      if (response.statusCode !== 204) {
        // handle error here
        return
      }

      updateSongBeatConfig(bpm, beatOffset, beatAroundEnd)
      renderRegions(
        wavesurferRef.current,
        {
          beatAroundEnd,
          beatOffset,
          bpm,
          songId: selectedSongId
        },
        {
          addRegion,
          updateRegionTime,
          selectRegion
        }
      )
    }

    const isRenderButtonDisabled =
      songBeatConfig.bpm <= 0 ||
      songBeatConfig.beatAroundEnd <= 0 ||
      songBeatConfig.beatOffset < 0 ||
      (songBeatConfig.bpm === bpm &&
        songBeatConfig.beatAroundEnd === beatAroundEnd &&
        songBeatConfig.beatOffset === beatOffset)

    return (
      <div className="flex items-center ml-auto">
        <div className="flex items-center mr-2">
          <label htmlFor="suggested-bpm" className="mr-2">
            BPM
          </label>
          <input
            id="suggested-bpm"
            type="number"
            value={songBeatConfig.bpm}
            onChange={handleBPM}
            className="w-16 border-solid rounded-md border-2 text-center"
          />
        </div>
        <div className="flex items-center mr-2">
          <label htmlFor="suggested-beat-offset" className="mr-2">
            Offset
          </label>
          <input
            id="suggested-beat-offset"
            type="number"
            value={songBeatConfig.beatOffset}
            onChange={handleBeatOffset}
            className="w-28 border-solid rounded-md border-2 text-center"
          />
        </div>
        <div className="flex items-center mr-2">
          <label htmlFor="suggested-beat-around-end" className="mr-2">
            Around end
          </label>
          <input
            id="suggested-beat-around-end"
            type="number"
            value={songBeatConfig.beatAroundEnd}
            onChange={handleBeatEndTime}
            className="w-28 border-solid rounded-md border-2 text-center"
          />
        </div>
        <button
          onClick={handleRenderBeats}
          disabled={isRenderButtonDisabled}
          className="py-1 px-2 text-blue-600/100 hover:bg-slate-200 hover:cursor-pointer bg-slate-100 border-slate-50 rounded-md disabled:opacity-50 disabled:cursor-no-drop"
        >
          Render beats
        </button>
      </div>
    )
  }
)

BeatController.displayName = "BeatController"
export default BeatController
