export const cloneArray = (array: any[]): any[] => {
  const clonedArray = []
  for (let i = 0; i < array.length; i++) {
    clonedArray.push(array[i])
  }
  return clonedArray
}
