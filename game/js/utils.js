import * as g from './globals.js'
import { doc } from './dom-navigation.js'

export const canMove = (rowIdx, colIdx, selRowIdx, selColIdx) => {
  if (
    Math.abs(rowIdx - selRowIdx) < 2 &&
    Math.abs(colIdx - selColIdx) < 2 &&
    Math.abs(rowIdx - selRowIdx) + Math.abs(colIdx - selColIdx) < 2
  ) {
    return true
  }
  return false
}

export const logging = () => {
  console.count('Log #')
  console.log(g.board)
  console.table({
    stage: g.stage,
    turn: g.turn,
    skipSetup: g.skipSetup,
  })
}

export const countPieces = item => {
  let count = 0
  for (let rowIdx = 0; rowIdx < 5; rowIdx++) {
    for (let colIdx = 0; colIdx < 5; colIdx++) {
      if (g.board[rowIdx][colIdx][0] === item) {
        count++
      }
    }
  }
  return count
}

export const forEachTile = fn => {
  for (let rowIdx = 0; rowIdx < 5; rowIdx++) {
    for (let colIdx = 0; colIdx < 5; colIdx++) {
      const btn = doc(`tile-${rowIdx}-${colIdx}`)
      var newTileData = fn(rowIdx, colIdx, g.board[rowIdx][colIdx][0], g.board[rowIdx][colIdx][1], btn)
      if (newTileData) {
        g.board[rowIdx][colIdx][0] = newTileData[0]
        g.board[rowIdx][colIdx][1] = newTileData[1]
      }
    }
  }
}

