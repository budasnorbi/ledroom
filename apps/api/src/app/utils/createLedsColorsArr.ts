export const createLedsColorsArr = (
  color: [number, number, number],
  range?: [number, number]
): number[] => {
  const [startLed, endLed] = range ?? [0, 900]

  const array = []
  for (let i = 0; i < 900; i++) {
    if (startLed < endLed) {
      if (i >= startLed && i <= endLed) {
        array.push(color[0], color[1], color[2])
      } else {
        array.push(0, 0, 0)
      }
    } else {
      if (i >= startLed || i <= endLed) {
        array.push(color[0], color[1], color[2])
      } else {
        array.push(0, 0, 0)
      }
    }
  }

  return array
}
