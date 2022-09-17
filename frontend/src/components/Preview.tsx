import { socket } from "@api/socket"
import { useEffect, useRef } from "react"

let ledCoordinatesX: number[] = new Array(187 + 98 + 35 + 84 + 231 + 186)
let ledCoordinatesY: number[] = new Array(187 + 98 + 35 + 84 + 231 + 186)

const agyFalRange: [number, number] = [75, 306]
const ablakFalRange: [number, number] = [307, 493]
const kanapeFalRange: [number, number] = [494, 681]
const butonFalRange: [number, number] = [682, 780]
const butorKilogasFalRange: [number, number] = [780, 815]
const ajtoFalRange: [number, number] = [816, 74]

const ledSize = 5

const Preview = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    let ctx: CanvasRenderingContext2D | null
    if (canvasRef.current) {
      const canvas = canvasRef.current
      ctx = canvas.getContext("2d")

      if (ctx) {
        socket.on("frame", (data) => {
          for (let i = 0; i < ledCoordinatesX.length; i++) {
            const red = data[i * 3]
            const green = data[i * 3 + 1]
            const blue = data[i * 3 + 2]

            /* @ts-ignore */
            ctx.fillStyle = `rgb(${red},${green}, ${blue})`
            /* @ts-ignore */
            ctx.fillRect(ledCoordinatesX[i], ledCoordinatesY[i], ledSize, ledSize)
          }
        })

        const scale = window.devicePixelRatio
        canvas.width = canvas.width * scale
        canvas.height = canvas.height * scale

        ctx.strokeStyle = ""
        ctx.fillStyle = "rgba(0,0,0,.1)"
        ctx.scale(scale, scale)
        for (let i = 0; i < 187; i++) {
          ctx.fillRect(i * ledSize, 0, ledSize, ledSize)
          ledCoordinatesX[kanapeFalRange[0] + i] = i * ledSize
          ledCoordinatesY[kanapeFalRange[0] + i] = 0
        }
        for (let i = 0; i < 98; i++) {
          ctx.fillRect(187 * ledSize, i * ledSize, ledSize, ledSize)
          ledCoordinatesX[butonFalRange[0] + i] = 187 * ledSize
          ledCoordinatesY[butonFalRange[0] + i] = i * ledSize
        }
        for (let i = 0; i < 35; i++) {
          ledCoordinatesX[butorKilogasFalRange[0] + i] = 187 * ledSize + i * ledSize
          ledCoordinatesY[butorKilogasFalRange[0] + i] = 98 * ledSize
          ctx.fillRect(187 * ledSize + i * ledSize, 98 * ledSize, ledSize, ledSize)
        }

        for (let i = 0; i < 84; i++) {
          if (ajtoFalRange[0] + i >= 826) {
            ledCoordinatesX[i - (826 - 816)] = 187 * ledSize + 35 * ledSize
            ledCoordinatesY[i - (826 - 816)] = 98 * ledSize + i * ledSize
          } else {
            ledCoordinatesX[ajtoFalRange[0] + i] = 187 * ledSize + 35 * ledSize
            ledCoordinatesY[ajtoFalRange[0] + i] = 98 * ledSize + i * ledSize
          }

          ctx.fillRect(187 * ledSize + 35 * ledSize, 98 * ledSize + i * ledSize, ledSize, ledSize)
        }
        for (let i = 0; i < 222; i++) {
          ledCoordinatesX[agyFalRange[0] + i] = 187 * ledSize + 35 * ledSize - i * ledSize
          ledCoordinatesY[agyFalRange[0] + i] = 98 * ledSize + 84 * ledSize

          ctx.fillRect(
            187 * ledSize + 35 * ledSize - i * ledSize,
            98 * ledSize + 84 * ledSize,
            ledSize,
            ledSize
          )
        }
        for (let i = 0; i < 182; i++) {
          ledCoordinatesX[ablakFalRange[0] + i] = 0
          ledCoordinatesY[ablakFalRange[0] + i] = 98 * ledSize + 84 * ledSize - i * ledSize

          ctx.fillRect(0, 98 * ledSize + 84 * ledSize - i * ledSize, ledSize, ledSize)
        }
      }
    }

    return () => {
      ctx?.clearRect(0, 0, 500, 500)
      ledCoordinatesX = []
      ledCoordinatesY = []
    }
  }, [])

  return (
    <div className="preview">
      <canvas width={1150} height={920} ref={canvasRef}></canvas>
    </div>
  )
}

export default Preview
