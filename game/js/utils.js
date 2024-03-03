export const countPieces = (item, grid) => {
  let count = 0
  for (let rowIdx = 0; rowIdx < 5; rowIdx++) {
    for (let colIdx = 0; colIdx < 5; colIdx++) {
      if (grid[rowIdx][colIdx][0] === item) {
        count++
      }
    }
  }
  return count
}