export const fixColorOrder = (ledsColorsData: number[]) => {
  const fixedColorsData = new Array(ledsColorsData.length).fill(undefined)
  // Fixing rgb color order
  for (let i = 0; i < ledsColorsData.length; i += 3) {
    const red = ledsColorsData[i]
    const green = ledsColorsData[i + 1]

    fixedColorsData[i] = green
    fixedColorsData[i + 1] = red
    fixedColorsData[i + 2] = ledsColorsData[i + 2]
  }
  return fixedColorsData
}
