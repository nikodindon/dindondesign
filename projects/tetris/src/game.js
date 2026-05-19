```javascript
const COLS = 10;
const ROWS = 20;
const empty = 0;

const PIECES = {
  I: {
    color: 1,
    shapes: [
      [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
      [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],
      [[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]],
      [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]]
    ]
  },
  O: {
    color: 2,
    shapes: [
      [[1,1],[1,1]],
      [[1,1],[1,1]],
      [[1,1],[1,1]],
      [[1,1],[1,1]]
    ]
  },
  T: {
    color: 3,
    shapes: [
      [[0,1,0],[1,1,1],[0,0,0]],
      [[0,1,0],[0,1,1],[0,1,0]],
      [[0,0,0],[1,1,1],[0,1,0]],
      [[0,1,0],[1,1,0],[0,1,0]]
    ]
  },
  S: {
    color: 4,
    shapes: [
      [[0,1,1],[1,1,0],[0,0,0]],
      [[0,1,0],[0,1,1],[0,0,1]],
      [[0,0,0],[0,1,1],[1,1,0]],
      [[1,0,0],[1,1,0],[0,1,0]]
    ]
  },
  Z: {
    color: 5,
    shapes: [
      [[1,1,0],[0,1,1],[0,0,0]],
      [[0,0,1],[0,1,1],[0,1,0]],
      [[0,0,0],[1,1,0],[0,1,1]],
      [[0,1,0],[1,1,0],[1,0,0]]
    ]
  },
  J: {
    color: 6,
    shapes: [
      [[1,0,0],[1,1,1],[0,0,0]],
      [[0,1,1],[0,1,0],[0,1,0]],
      [[0,0,0],[1,1,1],[0,0,1]],
      [[0,1,0],[0,1,0],[1,1,0]]
    ]
  },
  L: {
    color: 7,
    shapes: [
      [[0,0,1],[1,1,1],[0,0,0]],
      [[0,1,0],[0,1,0],[0,1,1]],
      [[0,0,0],[1,1,1],[1,0,0]],
      [[1,1,0],[0,1,0],[0,1,0]]
    ]
  }
};

const PIECE_NAMES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
const COLORS = {
  0: null,
  1: '#00f0f0',
  2: '#f0f000',
  3: '#a000f0',
  4: '#00f000',
  5: '#f00000',
  6: '#0000f0',
  7: '#f0a000'
};

let board = [];
let currentPiece = null;
let currentRotation = 0;
let currentRow = 0;
let currentCol = 0;
let currentShape = null;
let score = 0;
let lines = 0;
let level = 1;
let gameOver = false;
let paused = false;
let dropInterval = 1000;
let lastDropTime = 0;
let animationId = null;
let bag = [];

function initBoard() {
  board = [];
  for (let r = 0; r < ROWS; r++) {
    board[r] = [];
    for (let c = 0; c < COLS; c++) {
      board[r][c] = empty;
    }
  }
}

function getFromBag() {
  if (bag.length === 0) {
    bag = [...PIECE_NAMES];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
  }
  return bag.pop();
}

function spawnPiece() {
  const name = getFromBag();
  currentPiece = name;
  currentRotation = 0;
  currentShape = PIECES[name].shapes[0];
  currentRow = 0;
  currentCol = Math.floor((COLS - currentShape[0].length) / 2);

  if (collision(currentShape, currentRow, currentCol)) {
    gameOver = true;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }
}

function collision(shape, row, col) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] !== empty) {
        const boardRow = row + r;
        const boardCol = col + c;
        if (boardCol < 0 || boardCol >= COLS || boardRow >= ROWS) {
          return true;
        }
        if (boardRow >= 0 && board[boardRow][boardCol] !== empty) {
          return true;
        }
      }
    }
  }
  return false;
}

function move(dc, dr) {
  if (gameOver || paused) return false;
  const newRow = currentRow + dr;
  const newCol = currentCol + dc;
  if (!collision(currentShape, newRow, newCol)) {
    currentRow = newRow;
    currentCol = newCol;
    return true;
  }
  return false;
}

function rotate() {
  if (gameOver || paused) return;
  if (currentPiece === 'O') return;
  const newRotation = (currentRotation + 1) % 4;
  const newShape = PIECES[currentPiece].shapes[newRotation];
  const kicks = [0, -1, 1, -2, 2];
  for (let kick of kicks) {
    if (!collision(newShape, currentRow, currentCol + kick)) {
      currentRotation = newRotation;
      currentShape = newShape;
      currentCol += kick;
      return;
    }
  }
}

function hardDrop() {
  if (gameOver || paused) return;
  let dropDistance = 0;
  while (!collision(currentShape, currentRow + 1, currentCol)) {
    currentRow++;
    dropDistance++;
  }
  score += dropDistance * 2;
  lock();
}

function softDrop() {
  if (gameOver || paused) return;
  if (move(0, 1)) {
    score += 1;
    return true;
  }
  return false;
}

function lock() {
  if (gameOver || paused) return;
  for (let r = 0; r < currentShape.length; r++) {
    for (let c = 0; c < currentShape[r].length; c++) {
      if (currentShape[r][c] !== empty) {
        const boardRow = currentRow + r;
        const boardCol = currentCol + c;
        if (boardRow >= 0 && boardRow < ROWS && boardCol >= 0 && boardCol < COLS) {
          board[boardRow][boardCol] = PIECES[currentPiece].color;
        }
      }
    }
  }
  clearLines();
  spawnPiece();
}

function clearLines() {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    let full = true;
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] === empty) {
        full = false;
        break;
      }
    }
    if (full) {
      board.splice(r, 1);
      const newRow = [];
      for (let c = 0; c < COLS; c++) {
        newRow.push(empty);
      }
      board.unshift(newRow);
      cleared++;
      r++;
    }
  }
  if (cleared > 0) {
    const lineScores = [0, 100, 300, 500, 800];
    score += (lineScores[cleared] || 800) * level;
    lines += cleared;
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(50, 1000 - (level - 1) * 80);
  }
}

function togglePause() {
  paused = !paused;
}

function getDropSpeed() {
  return dropInterval;
}

function isGameOver() {
  return gameOver;
}

function isPaused() {
  return paused;
}

function getScore() {
  return score;
}

function getLines() {
  return lines;
}

function getLevel() {
  return level;
}

function getCurrentShape() {
  return currentShape;
}

function getCurrentRow() {
  return currentRow;
}

function getCurrentCol() {
  return currentCol;
}

function getBoard() {
  return board;
}

function getGhostRow() {
  if (gameOver || paused) return currentRow;
  let ghostRow = currentRow;
  while (!collision(currentShape, ghostRow + 1, currentCol)) {
    ghostRow++;
  }
  return ghostRow;
}

function resetGame() {
  initBoard();
  score = 0;
  lines = 0;
  level = 1;
  dropInterval = 1000;
  gameOver = false;
  paused = false;
  bag = [];
  spawnPiece();
}

function gameLoop(timestamp) {
  if (gameOver) {
    return;
  }
  if (!paused) {
    if (timestamp - lastDropTime > dropInterval) {
      if (!move(0, 1)) {
        lock();
      }
      lastDropTime = timestamp;
    }
  }
  animationId = requestAnimationFrame(gameLoop);
}

function startGame(canvas) {
  initBoard();
  resetGame();
  lastDropTime = performance.now();
  animationId = requestAnimationFrame(gameLoop);
}

function stopGame() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    COLS, ROWS, empty,
    PIECES, PIECE_NAMES, COLORS,
    getBoard, getScore, getLines, getLevel,
    getCurrentShape, getCurrentRow, getCurrentCol,
    getGhostRow, isGameOver, isPaused,
    spawnPiece, move, rotate, hardDrop, softDrop,
    collision, lock, clearLines,
    togglePause, resetGame,
    startGame, stopGame,
    getDropSpeed
  };
}
```
