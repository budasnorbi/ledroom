import { ChangeEvent, FC, useCallback, useState } from "react"
import { useStore } from "src/store/store"
import { EffectRegion, Effects } from "@type/store"

interface Props {}

/* 
{selectedRegion.effects.map((effect) => (
                      <div key={effect.type}>
                        <span>{effect.type}</span>
                        {effect.type === "blink" && (
                          <BlinkEffect
 duration={effect.duration}
                            setDuration={setEffectDuration}
                            range={effect.range}
                            setRange={setEffectRange} 
                          />
                        )}
                      </div>
                    ))}
*/

export const RegionEffectEditor: FC<Props> = (props) => {
  const [selectedEffect, setSelectedEffect] = useState<Effects>("blink")

  const addEffectToRegion = useStore.use.addEffectToRegion()
  //const selectedRegionId = useStore.use.sele()

  // const selectedRegionTimeRange: [number, number] | undefined = useStore(
  //   useCallback(
  //     (state) => {
  //       // for (let i = 0; i < state.regions.length; i++) {
  //       //   if (state.regions[i].id === selectedRegionId) {
  //       //     const { startTime, endTime } = state.regions[i]
  //       //     return [startTime, endTime]
  //       //   }
  //       // }
  //       return undefined
  //     },
  //     [selectedRegionId]
  //   )
  // )

  const handleEffectSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as Effects
    setSelectedEffect(value)
  }

  const handleEffectAdd = useCallback(() => {
    addEffectToRegion(selectedEffect)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEffect])

  // const selectedRegion: EffectRegion | null = useStore(
  //   useCallback(
  //     (state) => {
  //       // for (let i = 0; i < state.regions.length; i++) {
  //       //   if (state.regions[i].id === selectedRegionId) {
  //       //     return state.regions[i]
  //       //   }
  //       // }
  //       return null
  //     },
  //     [selectedRegionId]
  //   )
  // )

  return null
  // <div className="editorPanel">
  //   {selectedRegionId && selectedRegionTimeRange && (
  //     <>
  //       <div style={{ display: "flex" }}>
  //         <div>
  //           Time range: {selectedRegionTimeRange[0].toPrecision(5)} -{" "}
  //           {selectedRegionTimeRange[1].toPrecision(5)}
  //         </div>
  //       </div>
  //       <div style={{ marginTop: "15px" }}>
  //         <div>
  //           <h2>Effects</h2>
  //           <select value={selectedEffect} onChange={handleEffectSelect}>
  //             <option value="step">step</option>
  //             <option value="blink">blink</option>
  //           </select>
  //           <button onClick={handleEffectAdd}>add</button>
  //         </div>
  //         {/* <div>
  //           <h2>Selected effects:</h2>
  //           <div></div>
  //         </div> */}
  //         {/* <BezierCurveEditor value={bezierValues} onChange={handleBezierUpdate} />
  //          */}
  //       </div>
  //     </>
  //   )}
  // </div>
}
