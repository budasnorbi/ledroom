import { ChangeEvent, FC, MutableRefObject, useEffect, useState } from "react"
import { useStore } from "../store/store"
import { Delete } from "./icons/delete"
import { StepEffectForm } from "./effects/StepEffect"

interface Props {
  wavesurferRef: MutableRefObject<WaveSurfer>
  selectedRegionId: string
}

/*   useEffect(() => {
    if (selectedRegion?.id) {
      setBezierValues(selectedRegion.bezierValues)
    }
  }, [selectedRegion?.bezierValues]) */

/*   const handleBezierUpdate = (values: [number, number, number, number]) => {
    setBezierValues(values)
    if (bezierChangeTimeout) {
      clearTimeout(bezierChangeTimeout)
    }

    bezierChangeTimeout = setTimeout(() => {
      updateRegion({ bezierValues: values })
    }, 350)
  } */

export const EffectController: FC<Props> = ({ wavesurferRef, selectedRegionId }) => {
  const removeSelectedRegion = useStore.use.removeSelectedRegion()
  const removeSelectedEffect = useStore.use.removeSelectedEffect()
  const selectOrAddEffect = useStore.use.selectOrAddEffect()

  const selectedEffect = useStore((state) => {
    const selectedSong = state.songs.find((song) => song.id === state.selectedSongId)

    if (!selectedSong) {
      return null
    }

    const region = state.regions.find((region) => region.id === selectedSong.selectedRegionId)

    if (!region) {
      return null
    }

    const selectedEffect = state.effects.find(
      (effect) =>
        selectedSong.selectedRegionId === effect.regionId && effect.id === region.selectedEffect
    )

    return selectedEffect ?? null
  })

  const [selectedEffectOption, selectEffectOption] = useState<"" | "step">("")

  const onEffectChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const type = event.target.value as "" | "step"
    selectEffectOption(type)
    selectOrAddEffect(type)
  }

  useEffect(() => {
    selectEffectOption(selectedEffect?.type ? selectedEffect.type : "")
  }, [selectedRegionId])

  useEffect(() => {
    if (selectedEffect === null) {
      selectEffectOption("")
    }
  }, [!!selectedEffect])

  return (
    <div className="px-2">
      <div className="flex">
        <button
          onClick={() => removeSelectedRegion(wavesurferRef.current)}
          className="flex items-center py-2 px-4 text-blue-600/100 font-medium hover:bg-slate-200 hover:cursor-pointer bg-slate-100 border-slate-50 rounded-lg"
        >
          <Delete />
          <span className="ml-2">Region</span>
        </button>
        <div className="mx-2">
          <select
            className="border-solid rounded-md bg-slate-100 py-3 px-4"
            onChange={onEffectChange}
            value={selectedEffectOption}
          >
            <option value="">select an effect</option>
            <option value="step">step</option>
          </select>
        </div>
        {selectedEffect && (
          <button
            onClick={() => removeSelectedEffect()}
            className="flex items-center py-2 px-4 text-blue-600/100 font-medium hover:bg-slate-200 hover:cursor-pointer bg-slate-100 border-slate-50 rounded-lg"
          >
            <Delete />
            <span className="ml-2">Effect</span>
          </button>
        )}
      </div>
      <div className="py-4">
        {selectedEffect?.type === "step" && <StepEffectForm {...selectedEffect} />}
      </div>
    </div>
  )
}
