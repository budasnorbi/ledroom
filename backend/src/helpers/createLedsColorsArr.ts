export const createLedsColorsArr = (r: number, g: number, b: number): number[] => {
  const array = []
  for (let i = 0; i < 900; i++) {
    array.push(r, g, b)
  }

  return array
}
