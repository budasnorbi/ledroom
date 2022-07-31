import { Blink, Effects } from "@type/store"
import { ChangeEvent, useState, useCallback, FC } from "react"
import { useStore } from "@store/"

export const BlinkEffect: FC<{
  /*   duration: number
  setDuration: (type: "blink", duration: number) => void
  range: [number, number]
  setRange: (type: Effects, range: [number, number]) => void */
}> = (props) => {
  const setEffectDuration = useStore(useCallback((state) => state.setEffectDuration, []))
  console.log(setEffectDuration)
  return (
    <div>asd</div>
    /* <div style={{ display: "flex", border: "solid 1px black", padding: "10px" }}>
      <div>
        <span>Duration</span>
        <input
          type="number"
          value={props.duration}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            props.setDuration("blink", event.target.valueAsNumber)
          }
        />
      </div>
      <div>
        <span>Range</span>
        <div style={{ display: "flex" }}>
          <input
            type="number"
            value={props.range[0]}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              props.setRange("blink", [event.target.valueAsNumber, props.range[1]])
            }
          />
          <input
            type="number"
            value={props.range[1]}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              props.setRange("blink", [props.range[0], event.target.valueAsNumber])
            }
          />
        </div>
      </div>
    </div> */
  )
}
