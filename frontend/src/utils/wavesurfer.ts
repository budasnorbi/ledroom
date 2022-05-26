export function formatTimeCallback(seconds: number, pxPerSec: number) {
  seconds = Number(seconds)
  var minutes = Math.floor(seconds / 60)
  seconds = seconds % 60

  // fill up seconds with zeroes
  var secondsStr = Math.round(seconds).toString()
  if (pxPerSec >= 25 * 10) {
    secondsStr = seconds.toFixed(2)
  } else if (pxPerSec >= 25 * 1) {
    secondsStr = seconds.toFixed(1)
  }

  if (minutes > 0) {
    if (seconds < 10) {
      secondsStr = "0" + secondsStr
    }
    return `${minutes}:${secondsStr}`
  }
  return secondsStr
}

export function timeInterval(pxPerSec: number) {
  var retval = 1
  if (pxPerSec >= 25 * 100) {
    retval = 0.01
  } else if (pxPerSec >= 25 * 40) {
    retval = 0.025
  } else if (pxPerSec >= 25 * 10) {
    retval = 0.1
  } else if (pxPerSec >= 25 * 4) {
    retval = 0.25
  } else if (pxPerSec >= 25) {
    retval = 1
  } else if (pxPerSec * 5 >= 25) {
    retval = 5
  } else if (pxPerSec * 15 >= 25) {
    retval = 15
  } else {
    retval = Math.ceil(0.5 / pxPerSec) * 60
  }
  return retval
}

export function primaryLabelInterval(pxPerSec: number) {
  var retval = 1
  if (pxPerSec >= 25 * 100) {
    retval = 10
  } else if (pxPerSec >= 25 * 40) {
    retval = 4
  } else if (pxPerSec >= 25 * 10) {
    retval = 10
  } else if (pxPerSec >= 25 * 4) {
    retval = 4
  } else if (pxPerSec >= 25) {
    retval = 1
  } else if (pxPerSec * 5 >= 25) {
    retval = 5
  } else if (pxPerSec * 15 >= 25) {
    retval = 15
  } else {
    retval = Math.ceil(0.5 / pxPerSec) * 60
  }
  return retval
}

export function secondaryLabelInterval(pxPerSec: number) {
  // draw one every 10s as an example
  return Math.floor(10 / timeInterval(pxPerSec))
}
