import { RGBColor } from "react-color";

export function rgba2rgb(rgba: RGBColor): [number, number, number] {
  const background = { r: 0, g: 0, b: 0 };
  const alpha = rgba.a;

  return [
    (1 - alpha) * background.r + alpha * rgba.r,
    (1 - alpha) * background.g + alpha * rgba.g,
    (1 - alpha) * background.b + alpha * rgba.b,
  ];
}
