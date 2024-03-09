import * as g from './globals.js'
import { doc, jInsert, btnClick } from './dom-navigation.js'
import { logging, canMove, countPieces, forEachTile } from './utils.js'

var stage = g.stage
var turn = g.turn
var board = g.board
var skipSetup = g.skipSetup
var xDeaths = 0
var oDeaths = 0

const changeTurn = () => {
  stage = 'select'
  turn === 'x' ? (turn = 'o') : (turn = 'x')
}

const fillBoard = () => {
  forEachTile((rowIdx, colIdx, tileValue, tileTrait) => {
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

const canBeKilled = (vRI, vCI, kRI, kCI) => {
  // v: VICTIM --adj
  // _V: VALUE --adj
  // k: KILLER --adj
  // ri: ROW INDEX --int
  // ci: COLUMN INDEX --int
  // tt: TILE TRAIT --str

  if (kCI === undefined && kRI === undefined) {
    var kRI
    var kCI
    forEachTile((ri, ci, _, tt) => {
      if (tt === 'attacker') {
        kRI = ri
        kCI = ci
      }
    })
  }
  var kV = board[kRI][kCI][0]
  var vV = board[vRI][vCI][0]

  if (kV === vV) return false

  if (
    kRI === vRI &&
    ((kCI - 1 === vCI && kCI >= 2 && board[kRI][kCI - 2][0] === kV) ||
      (kCI + 1 === vCI && kCI <= 2 && board[kRI][kCI + 2][0] === kV))
  ) {
    return true
  }
  if (
    kCI === vCI &&
    ((kRI - 1 === vRI && kRI >= 2 && board[kRI - 2][kCI][0] === kV) ||
      (kRI + 1 === vRI && kRI <= 2 && board[kRI + 2][kCI][0] === kV))
  ) {
    return true
  }
  return false
}

const updateDOMState = () => {
  forEachTile((rowIdx, colIdx, tileValue, tileTrait, btn) => {
    btn.textContent = tileValue
    board[rowIdx][colIdx][1] === 'selected'
      ? (btn.style.fontWeight = 'bold')
      : (btn.style.fontWeight = '')
    board[rowIdx][colIdx][1] === 'attacker' ? (btn.style.color = 'red') : (btn.style.color = '')
    return [tileValue, tileTrait]
  })
  doc('stage-and-turn').textContent = `${turn[0].toUpperCase() + turn.substring(1)} - ${
    stage[0].toUpperCase() + stage.substring(1)
  }`
  doc('x-deaths').textContent = `${xDeaths}`
  doc('o-deaths').textContent = `${oDeaths}`
  logging()
}

const onTileClick = (ri, ci) => {
  /* ri: ROW INDEX - int
   * ci: COLUMN INDEX - int
   * tv: TILE VALUE - string
   * tt: TILE TRAIT - string
   * sl: SELECTED - adj
   */
  var tv = board[ri][ci][0]
  var tt = board[ri][ci][1]
  var oppositeTurn = turn === 'x' ? 'o' : 'x'

  const stageLogic = {
    setup: () => {
      if (countPieces('x') + countPieces('o') === 24) {
        stage = 'select'
      }
      if ((ri === 2 && ci === 2) || tv) return
      tv = turn
      Math.floor((1 + countPieces('x')) / 2) > Math.floor((1 + countPieces('o')) / 2)
        ? (turn = 'o')
        : (turn = 'x')
    },
    select: () => {
      if (countPieces('x') === 0) {
        stage = 'O Wins'
      } else if (countPieces('o') === 0) {
        stage = 'X Wins'
      }
      if (tv !== turn) return
      tt = 'selected'
      stage = 'move'
    },
    move: () => {
      if (tt === 'selected') {
        tt = ''
        stage = 'select'
      }
      if (tv) return
      forEachTile((slRI, slCI, _, slTT) => {
        if (slTT !== 'selected' || !canMove(ri, ci, slRI, slCI)) return
        tv = turn
        tt = 'attacker'
        stage = 'attack'
        return ['', '']
      })
      if (tt === 'attacker') return
      tt = ''
    },
    attack: () => {
      if (!tv) {
        stage = 'combo'
      } else if (canBeKilled(ri, ci)) {
        tv = ''
        if (turn === 'x') {
          oDeaths++
        } else {
          xDeaths++
        }
      } else {
        forEachTile((_, __, slTV, slTT) => {
          if (slTT !== 'attacker') return
          return [slTV, '']
        })
      }
    },
    combo: () => {
      forEachTile((_, __, slTV, slTT) => {
        if (slTT !== 'attacker') return
        slTT = ''
        if (
          (ri >= 2 && board[ri - 1][ci][0] === oppositeTurn && board[ri - 2][ci][0] === turn) ||
          (ri <= 2 && board[ri + 1][ci][0] === oppositeTurn && board[ri + 2][ci][0] === turn) ||
          (ci >= 2 && board[ri][ci - 1][0] === oppositeTurn && board[ri][ci - 2][0] === turn) ||
          (ci <= 2 && board[ri][ci + 1][0] === oppositeTurn && board[ri][ci + 2][0] === turn)
        ) {
          slTV = ''
          tv = turn
          tt = 'attacker'
          stage = 'attack'
        }
        return [slTV, slTT]
      })
    },
  }

  stageLogic[stage]()

  board[ri][ci][0] = tv
  board[ri][ci][1] = tt
  updateDOMState()
}

function main() {
  for (let ri = 0; ri < 5; ri++) {
    for (let ci = 0; ci < 5; ci++) {
      btnClick(
        jInsert('board', `$<button class = "tile" id="tile-${ri}-${ci}"></button>`),
        onTileClick.bind(null, ri, ci)
      )
    }
  }
  if (skipSetup) {
    fillBoard()
  }
  const endTurn = () => {
    forEachTile((_, __, slTV) => {
      return [slTV, '']
    })
    changeTurn()
    updateDOMState()
  }
  btnClick('end-turn-btn', endTurn)
  document.addEventListener('keydown', function (e) {
    if (e.key === 'e') {
      endTurn()
    }
  })

  var seconds = 0
  var minutes = 0
  var hours = 0
  const timer = doc('time')
  setInterval(() => {
    seconds++
    if (seconds === 60) {
      seconds = 0
      minutes++
    }
    if (minutes === 60) {
      minutes = 0
      hours++
    }
    timer.textContent = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    console.log()
  }, 1000)

  updateDOMState()
}
main()
