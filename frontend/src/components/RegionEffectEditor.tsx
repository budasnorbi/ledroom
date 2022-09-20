import { FC } from "react"

interface Props {}

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

export const RegionEffectEditor: FC<Props> = (props) => {
  return (
    <div className="px-2 py-3">
      <div>
        <h1 className="text-2xl mb-2">Region Effects</h1>
        <select>
          <option value="step">step</option>
          <option value="blink">blink</option>
        </select>
        <button>add</button>
      </div>
      {/* <div>
            <h2>Selected effects:</h2>
            <div></div>
          </div> */}
      {/* <BezierCurveEditor value={bezierValues} onChange={handleBezierUpdate} />
       */}
    </div>
  )
}
