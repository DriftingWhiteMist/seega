import { btnClick, doc, jInsert } from './dom-navigation.js'
import { countPieces } from './utils.js'
import * as vars from './variables.js'

var stage = vars.stage
var turn = vars.turn
var board = vars.board
var skipSetup = false
var testingMovement = false

const logging = () => {
  console.log(board)
  console.table({
    stage: stage,
    turn: turn,
    skipSetup: skipSetup,
    testingMovement: testingMovement,
  })
}

const changeTurn = () => {
  turn === 'x' ? (turn = 'o') : (turn = 'x')
}

const canMove = (rowIdx, colIdx, selRowIdx, selColIdx) => {
  if (
    Math.abs(rowIdx - selRowIdx) < 2 &&
    Math.abs(colIdx - selColIdx) < 2 &&
    Math.abs(rowIdx - selRowIdx) + Math.abs(colIdx - selColIdx) < 2
  ) {
    return true
  }
  return false
}

const forEachBtn = fn => {
  for (let rowIdx = 0; rowIdx < 5; rowIdx++) {
    for (let colIdx = 0; colIdx < 5; colIdx++) {
      const btn = doc(`tile-${rowIdx}-${colIdx}`)
      var newTileData = fn(rowIdx, colIdx, board[rowIdx][colIdx][0], board[rowIdx][colIdx][1], btn)
      board[rowIdx][colIdx][0] = newTileData[0]
      board[rowIdx][colIdx][1] = newTileData[1]
    }
  }
}

const fillBoard = () => {
  forEachBtn((rowIdx, colIdx, tileValue, tileTrait) => {
    if (rowIdx === 2 && colIdx === 2) {
      return [tileValue, tileTrait]
    }
    Math.random() <= 0.5 || (countPieces('o', board) === 12 && countPieces('x', board) < 12)
      ? (tileValue = 'x')
      : (tileValue = 'o')
    stage = 'select'
    return [tileValue, tileTrait]
  })
}

const updateDOMState = () => {
  forEachBtn((rowIdx, colIdx, tileValue, tileTrait, btn) => {
    btn.textContent = tileValue
    board[rowIdx][colIdx][1] === 'selected'
      ? (btn.style.fontWeight = 'bold')
      : (btn.style.fontWeight = '')
    board[rowIdx][colIdx][1] === 'attacker' ? (btn.style.color = 'red') : (btn.style.color = '')
    return [tileValue, tileTrait]
  })
  doc('stage').textContent = `Stage - ${stage[0].toUpperCase() + stage.substring(1)}`
  doc('turn').textContent = ` || Turn - ${turn[0].toUpperCase() + turn.substring(1)}`
  logging()
}

const onTileClick = (rowIdx, colIdx) => {
  var tileValue = board[rowIdx][colIdx][0]
  var tileTrait = board[rowIdx][colIdx][1]
  if (stage === 'setup') {
    if (rowIdx === 2 && colIdx === 2) {
      return
    }
    if (!tileValue) {
      tileValue = turn
      Math.floor((1 + countPieces('x', board)) / 2) > Math.floor((1 + countPieces('o', board)) / 2)
        ? (turn = 'o')
        : (turn = 'x')
    }
    if (countPieces('x', board) + countPieces('o', board) === 24) {
      stage = 'select'
    }
  } else if (stage === 'select') {
    if (tileValue === turn && tileTrait === '') {
      tileTrait = 'selected'
      stage = 'move'
    }
  } else if (stage === 'move') {
    if (tileTrait === 'selected') {
      stage = 'select'
      tileTrait = ''
      changeTurn()
    } else if (tileTrait !== 'selected' && tileValue === '') {
      forEachBtn((selRowIdx, selColIdx, tv, tt) => {
        if (tt === 'selected') {
          tt = ''
          if (canMove(rowIdx, colIdx, selRowIdx, selColIdx)) {
            tv = ''
            stage = 'attack'
            tileTrait = 'attacker'
            tileValue = turn
          }
        }
        return [tv, tt]
      })
      if (testingMovement || tileTrait != 'attacker') {
        stage = 'select'
        changeTurn()
      }
    }
  } else if (stage == 'attack') {
    if (tileTrait === 'attacker') {
      tileTrait = ''
      stage = 'select'
      changeTurn()
    } else {
      if (tileValue === '') {
        forEachBtn((selRowIdx, selColIdx, tv, tt) => {
          if (tt === 'attacker') {
            tt = ''
            if (canMove(rowIdx, colIdx, selRowIdx, selColIdx)) {
              tv = ''
              tileValue = turn
              tileTrait = 'attacker'
            }
          }
          return [tv, tt]
        })
      } else if (1 /* can be killed */) {
        tileValue = ''
      }
    }
  }
  board[rowIdx][colIdx][0] = tileValue
  board[rowIdx][colIdx][1] = tileTrait
  updateDOMState()
}

for (let rowIdx = 0; rowIdx < 5; rowIdx++) {
  for (let colIdx = 0; colIdx < 5; colIdx++) {
    btnClick(
      jInsert('board', `$<button class = "tile" id="tile-${rowIdx}-${colIdx}"></button>`),
      onTileClick.bind(null, rowIdx, colIdx)
    )
  }
}
if (skipSetup) {
  fillBoard()
}
btnClick('add-piece', () => {
  var pieceType = doc('txtarea').value[0]
  var row = parseInt(doc('txtarea').value[1])
  var col = parseInt(doc('txtarea').value[2])

  if (doc('txtarea').value.length !== 3) {
    console.error('Invalid text in textbox')
  } else if (board[row][col][0] !== '' && pieceType !== ' ') {
    console.error("Can't update filled tile")
  } else if (pieceType === ' ') {
    board[row][col][0] = ''
  } else {
    board[row][col][0] = pieceType
  }
  updateDOMState()
})
updateDOMState()
