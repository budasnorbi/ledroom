export const rgb2Hex = (color: [number, number, number]): string => {
  // Need Meg kellett cserélni a bit shiftelést a pirosnál és a zöldnél, mert el lett rontva a wifi modulok apija
  // ez lenne a helyes sorrend const hex = ((color[0] << 16) + (color[1] << 8) + color[2]).toString(16)
  const hex = ((color[1] << 16) + (color[0] << 8) + color[2]).toString(16)
  return "0".repeat(6 - hex.length) + hex
}

export const fixOrder = (red, green, blue) => [green, red, blue]
