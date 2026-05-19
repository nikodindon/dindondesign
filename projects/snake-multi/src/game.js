<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Snake Game</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #111;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  flex-direction: column;
  font-family: 'Courier New', monospace;
  color: #eee;
}
canvas {
  border: 2px solid #444;
  background: #000;
}
#info {
  margin-top: 12px;
  font-size: 14px;
  color: #888;
}
</style>
</head>
<body>
<canvas id="gameCanvas" width="400" height="400"></canvas>
<div id="info">Arrow Keys / WASD to move &bull; Space to restart</div>
<script src="input.js"></script>
<script src="game.js"></script>
</body>
</html>
```

```js
// game.js

// ── Constants ──────────────────────────────────────────────
const CANVAS_W = 400;
const CANVAS_H = 400;
const GRID = 20;
const INITIAL_LENGTH = 3;
const SPEED = 100;

// ── DOM refs ───────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ── State ──────────────────────────────────────────────────
let snake = [];
let food = null;
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let gameOver = false;
let gameLoop = null;

// ── Helpers ────────────────────────────────────────────────

function cellSize() {
  return CANVAS_W / GRID;
}

function randomPosition() {
  const cols = GRID;
  const rows = GRID;
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows)
    };
  } while (snake.some(seg => seg.x === pos.x && seg.y === pos.y));
  return pos;
}

// ── Core logic ─────────────────────────────────────────────

function update() {
  if (gameOver) return;

  // Apply buffered direction (prevents 180° reversal within a single tick)
  direction = { ...nextDirection };

  // Compute new head position
  const head = snake[0];
  const newHead = {
    x: head.x + direction.x,
    y: head.y + direction.y
  };

  // Wall collision → game over
  const cols = GRID;
  const rows = GRID;
  if (newHead.x < 0 || newHead.x >= cols || newHead.y < 0 || newHead.y >= rows) {
    handleGameOver();
    return;
  }

  // Self collision → game over
  if (snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
    handleGameOver();
    return;
  }

  // Prepend new head
  snake.unshift(newHead);

  // Check food
  if (food && newHead.x === food.x && newHead.y === food.y) {
    score += 10;
    food = randomPosition();
    // Don't pop tail → snake grows
  } else {
    snake.pop(); // Move tail
  }
}

// ── Rendering ──────────────────────────────────────────────

function draw() {
  const cs = cellSize();

  // Clear
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Draw snake
  snake.forEach((seg, i) => {
    ctx.fillStyle = i === 0 ? '#4eff4e' : '#2ecc2e';
    ctx.fillRect(seg.x * cs + 1, seg.y * cs + 1, cs - 2, cs - 2);

    // Subtle border
    ctx.strokeStyle = '#1a5c1a';
    ctx.lineWidth = 1;
    ctx.strokeRect(seg.x * cs + 1, seg.y * cs + 1, cs - 2, cs - 2);
  });

  // Draw food
  if (food) {
    ctx.fillStyle = '#ff3b3b';
    ctx.beginPath();
    ctx.arc(
      food.x * cs + cs / 2,
      food.y * cs + cs / 2,
      cs / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Food glow
    ctx.shadowColor = '#ff3b3b';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Draw score
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${score}`, 8, 24);

  // Game over overlay
  if (gameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.fillStyle = '#ff3b3b';
    ctx.font = 'bold 36px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', CANVAS_W / 2, CANVAS_H / 2 - 20);

    ctx.fillStyle = '#fff';
    ctx.font = '18px "Courier New", monospace';
    ctx.fillText(`Final Score: ${score}`, CANVAS_W / 2, CANVAS_H / 2 + 16);

    ctx.fillStyle = '#aaa';
    ctx.font = '14px "Courier New", monospace';
    ctx.fillText('Press Space to restart', CANVAS_W / 2, CANVAS_H / 2 + 50);
  }
}

// ── Game control ───────────────────────────────────────────

function handleGameOver() {
  gameOver = true;
  if (gameLoop) {
    clearInterval(gameLoop);
    gameLoop = null;
  }
  draw();
}

function resetGame() {
  gameOver = false;
  score = 0;
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };

  // Build initial snake (left → right, horizontal, length 3)
  const startX = Math.floor(GRID / 2) - 1;
  const startY = Math.floor(GRID / 2);
  snake = [];
  for (let i = INITIAL_LENGTH - 1; i >= 0; i--) {
    snake.push({ x: startX - i, y: startY });
  }

  food = randomPosition();

  if (gameLoop) clearInterval(gameLoop);
  gameLoop = setInterval(() => {
    update();
    draw();
  }, SPEED);
}

// ── Input wiring ───────────────────────────────────────────

function initInput() {
  // Defer until input.js has been evaluated by the browser
  if (typeof setupInput === 'function') {
    // Convention: input.js exports setupInput(dirSetter)
    setupInput(newDir => {
      if (gameOver) return;

      // Prevent 180° reversal
      if (newDir.x + direction.x === 0 && newDir.y + direction.y === 0) return;

      nextDirection = { ...newDir };
    });
  }

  // Also wire Space for restart (universal fallback)
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (gameOver) resetGame();
    }
  });
}

// ── Start ──────────────────────────────────────────────────

initInput();
resetGame();
```

**How `input.js` should be structured** (so this `game.js` integrates seamlessly):

```js
// input.js
function setupInput(dirSetter) {
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowUp':    case 'w': case 'W': dirSetter({ x:  0, y: -1 }); break;
      case 'ArrowDown':  case 's': case 'S': dirSetter({ x:  0, y:  1 }); break;
      case 'ArrowLeft':  case 'a': case 'A': dirSetter({ x: -1, y:  0 }); break;
      case 'ArrowRight': case 'd': case 'D': dirSetter({ x:  1, y:  0 }); break;
    }
  });
}
```

**Key design decisions:**

| Concern | Implementation |
|---|---|
| **180° turn prevention** | Two-direction system: `direction` (applied during `update()`) and `nextDirection` (set by input). Reversal check in the callback rejects any input that would flip both axes simultaneously. |
| **Growth on food** | New head is `unshift`'d; tail is only `pop`'d when no food is eaten — so the array naturally grows by one. |
| **Game over** | Both wall and self-collision set `gameOver = true` and clear the interval, then draw the overlay. |
| **Restart** | `Space` key calls `resetGame()` which rebuilds the snake, re-centers direction, spawns fresh food, and restarts the interval. |
| **Input binding** | `initInput()` calls `setupInput(newDir => { … })` expecting the function exported by `input.js`. A separate `keydown` listener handles Space for restart regardless of what `input.js` does. |