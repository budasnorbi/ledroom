import { StepEffectForm } from "./forms/StepEffect"
import { useStore } from "../store/store"
import { FC, MutableRefObject } from "react"
import { Delete } from "./icons/delete"

interface Props {
  wavesurferRef: MutableRefObject<WaveSurfer>
  selectRegionId: string
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

export const RegionEffectController: FC<Props> = ({ selectRegionId, wavesurferRef }) => {
  const removeSelectedRegion = useStore.use.removeSelectedRegion()

  return (
    <div className="px-2">
      <div>
        <button
          onClick={() => removeSelectedRegion(wavesurferRef.current)}
          className="flex items-center py-2 px-4 text-blue-600/100 font-medium hover:bg-slate-200 hover:cursor-pointer bg-slate-100 border-slate-50 rounded-lg"
        >
          <Delete />
          <span className="ml-2">Region</span>
        </button>
      </div>
      <div className="my-2">
        {/* <label htmlFor="region-name" className="mb-2">
          Region Name
        </label>
        <input type="text" id="region-name" className="block border-solid rounded-md border-2" /> */}
        <select className="border-solid rounded-md border-4 bg-slate-100 mr-2">
          <option value="step">step</option>
        </select>
        <button className="py-1 px-2 text-blue-600/100 hover:bg-slate-200 hover:cursor-pointer bg-slate-100 border-slate-50 rounded-md disabled:opacity-50 disabled:cursor-no-drop">
          add
        </button>
      </div>
      <div>
        <StepEffectForm regionId="asd" />
      </div>
    </div>
  )
}
