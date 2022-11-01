export const getBezierCurveY = (time: number, bezierCoords: [number, number, number, number]) => {
  const [P0, P1, P2, P3] = bezierCoords

  return (
    Math.pow(1 - time, 3) * P0 +
    3 * Math.pow(1 - time, 2) * time * P1 +
    3 * (1 - time) * Math.pow(time, 2) * P2 +
    Math.pow(time, 3) * P3
  )
}

// 2 kontroller
