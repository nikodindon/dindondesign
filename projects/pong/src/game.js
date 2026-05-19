# Pong — `game.js`

```javascript
// ============================================================
// game.js — Pong Game
// ============================================================
import { Input } from './input.js';

// -----------------------------------------------------------
// CONSTANTS
// -----------------------------------------------------------
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;

const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;

const BALL_SIZE = 10;

const PLAYER_SPEED = 7;
const AI_SPEED = 4;
const BALL_SPEED = 6;

const WIN_SCORE = 5;

// Paddle horizontal positions
const PLAYER_X = 20;
const AI_X = CANVAS_WIDTH - 20 - PADDLE_WIDTH;

// -----------------------------------------------------------
// CANVAS SETUP
// -----------------------------------------------------------
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// -----------------------------------------------------------
// INPUT
// -----------------------------------------------------------
const input = new Input();

// -----------------------------------------------------------
// GAME STATE
// -----------------------------------------------------------
let playerY = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
let aiY = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;

let ballX = CANVAS_WIDTH / 2 - BALL_SIZE / 2;
let ballY = CANVAS_HEIGHT / 2 - BALL_SIZE / 2;
let ballVX = BALL_SPEED;
let ballVY = BALL_SPEED;

let playerScore = 0;
let aiScore = 0;

let gameState = 'playing'; // 'playing' | 'won'

// -----------------------------------------------------------
// HELPERS
// -----------------------------------------------------------

/** Clamp a value between min and max */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/** Randomise the initial serve direction */
function serveBall() {
    ballX = CANVAS_WIDTH / 2 - BALL_SIZE / 2;
    ballY = CANVAS_HEIGHT / 2 - BALL_SIZE / 2;

    // Randomise which side serves
    const dirX = Math.random() < 0.5 ? -1 : 1;

    // Randomise launch angle
    const angle = (Math.random() * Math.PI / 3) - Math.PI / 6; // ±30°

    ballVX = dirX * BALL_SPEED * Math.cos(angle);
    ballVY = BALL_SPEED * Math.sin(angle);
}

// -----------------------------------------------------------
// UPDATE
// -----------------------------------------------------------
function update() {
    if (gameState !== 'playing') return;

    // ---- Player movement (clamped) ----
    if (input.isDown('ArrowUp') || input.isDown('w') || input.isDown('W')) {
        playerY -= PLAYER_SPEED;
    }
    if (input.isDown('ArrowDown') || input.isDown('s') || input.isDown('S')) {
        playerY += PLAYER_SPEED;
    }
    playerY = clamp(playerY, 0, CANVAS_HEIGHT - PADDLE_HEIGHT);

    // ---- AI movement (follows ball with speed limit) ----
    const aiCenter = aiY + PADDLE_HEIGHT / 2;
    if (ballY + BALL_SIZE / 2 > aiCenter + 5) {
        aiY += AI_SPEED;
    } else if (ballY - BALL_SIZE / 2 < aiCenter - 5) {
        aiY -= AI_SPEED;
    }
    aiY = clamp(aiY, 0, CANVAS_HEIGHT - PADDLE_HEIGHT);

    // ---- Ball movement ----
    ballX += ballVX;
    ballY += ballVY;

    // ---- Wall bounce (top / bottom) ----
    if (ballY <= 0) {
        ballY = 0;
        ballVY = Math.abs(ballVY);
    }
    if (ballY + BALL_SIZE >= CANVAS_HEIGHT) {
        ballY = CANVAS_HEIGHT - BALL_SIZE;
        ballVY = -Math.abs(ballVY);
    }

    // ---- Paddle collision ----
    // Player paddle
    if (
        ballVX < 0 &&
        ballX <= PLAYER_X + PADDLE_WIDTH &&
        ballX + BALL_SIZE >= PLAYER_X &&
        ballY + BALL_SIZE >= playerY &&
        ballY <= playerY + PADDLE_HEIGHT
    ) {
        ballX = PLAYER_X + PADDLE_WIDTH;
        ballVX = Math.abs(ballVX);

        // Adjust angle based on where it hit the paddle
        const hitPos = (ballY + BALL_SIZE / 2 - playerY) / PADDLE_HEIGHT; // 0–1
        const angle = (hitPos - 0.5) * (Math.PI / 2.5);
        const speed = Math.sqrt(ballVX * ballVX + ballVY * ballVY);
        ballVX = Math.abs(speed * Math.cos(angle));
        ballVY = speed * Math.sin(angle);
    }

    // AI paddle
    if (
        ballVX > 0 &&
        ballX + BALL_SIZE >= AI_X &&
        ballX <= AI_X + PADDLE_WIDTH &&
        ballY + BALL_SIZE >= aiY &&
        ballY <= aiY + PADDLE_HEIGHT
    ) {
        ballX = AI_X - BALL_SIZE;
        ballVX = -Math.abs(ballVX);

        const hitPos = (ballY + BALL_SIZE / 2 - aiY) / PADDLE_HEIGHT;
        const angle = (hitPos - 0.5) * (Math.PI / 2.5);
        const speed = Math.sqrt(ballVX * ballVX + ballVY * ballVY);
        ballVX = -Math.abs(speed * Math.cos(angle));
        ballVY = speed * Math.sin(angle);
    }

    // ---- Scoring ----
    if (ballX < -BALL_SIZE) {
        // AI scores
        aiScore++;
        if (aiScore >= WIN_SCORE) {
            gameState = 'won';
        } else {
            serveBall();
        }
    }
    if (ballX > CANVAS_WIDTH + BALL_SIZE) {
        // Player scores
        playerScore++;
        if (playerScore >= WIN_SCORE) {
            gameState = 'won';
        } else {
            serveBall();
        }
    }
}

// -----------------------------------------------------------
// DRAW
// -----------------------------------------------------------
function draw() {
    // ---- Clear black ----
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // ---- Center dashed line ----
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // ---- Player paddle ----
    ctx.fillStyle = '#fff';
    ctx.fillRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // ---- AI paddle ----
    ctx.fillRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // ---- Ball ----
    ctx.fillRect(ballX, ballY, BALL_SIZE, BALL_SIZE);

    // ---- Scores ----
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';

    // Player score (left)
    ctx.fillText(playerScore, CANVAS_WIDTH / 4, 60);

    // AI score (right)
    ctx.fillText(aiScore, (CANVAS_WIDTH / 4) * 3, 60);

    // ---- Win screen ----
    if (gameState === 'won') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';

        const winner = playerScore >= WIN_SCORE ? 'Player Wins!' : 'AI Wins!';
        ctx.fillText(winner, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

        ctx.font = '20px monospace';
        ctx.fillText('Press R to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);

        // Allow restart
        if (input.isDown('r') || input.isDown('R')) {
            playerScore = 0;
            aiScore = 0;
            gameState = 'playing';
            playerY = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
            aiY = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
            serveBall();
        }
    }
}

// -----------------------------------------------------------
// GAME LOOP
// -----------------------------------------------------------
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// -----------------------------------------------------------
// START
// -----------------------------------------------------------
serveBall();
requestAnimationFrame(gameLoop);
```

## How it works

| Section | Detail |
|---|---|
| **Constants** | All dimensions, speeds, and `WIN_SCORE = 5` are defined at the top for easy tweaking |
| **`update()`** | Processes input → clamps paddles → moves AI toward ball with `AI_SPEED` limit → moves ball → wall bounces → paddle collisions (with angle adjustment) → scoring & reset |
| **`draw()`** | Clears to black, draws the center dashed line, both paddles, the ball, both scores, and a win overlay with restart prompt |
| **Game loop** | `requestAnimationFrame(gameLoop)` drives the cycle at the display's refresh rate |
| **Win condition** | First to **5 points** triggers the win screen; press **R** to restart |

### `input.js` contract

The `Input` class is expected to provide:

```javascript
class Input {
    constructor() { /* bind keydown/keyup listeners */ }
    isDown(key) { return this.keys[key] === true; }
}
```

Keys supported: **ArrowUp / ArrowDown**, **W / S**, and **R** for restart.