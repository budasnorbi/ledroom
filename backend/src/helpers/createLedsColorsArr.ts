import { fixOrder } from "./rgb2Hex"

export const createLedsColorsArr = (r: number, g: number, b: number): Array<number> => {
  const array = []
  for (let i = 0; i < 900; i++) {
    array.push(...fixOrder(r, g, b))
  }

  return array
}
