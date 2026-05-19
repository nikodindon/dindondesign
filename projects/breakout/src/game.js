const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ─── Constants ──────────────────────────────────────────────
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const PADDLE_Y = CANVAS_HEIGHT - 40;
const BALL_RADIUS = 10;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = 80;
const BRICK_HEIGHT = 25;
const BRICK_PADDING = 8;
const BRICK_OFFSET_TOP = 50;
const BRICK_OFFSET_LEFT = (CANVAS_WIDTH - (BRICK_COLS * (BRICK_WIDTH + BRICK_PADDING) - BRICK_PADDING)) / 2;
const BRICK_COLORS = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db'];
const INITIAL_SPEED = 5;

// ─── Game State ─────────────────────────────────────────────
let paddleX = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
let ballX = CANVAS_WIDTH / 2;
let ballY = PADDLE_Y - BALL_RADIUS;
let ballVX = INITIAL_SPEED * Math.cos(Math.PI / 4);
let ballVY = -INITIAL_SPEED * Math.sin(Math.PI / 4);
let bricks = [];
let score = 0;
let lives = 3;
let gameState = 'playing'; // 'playing' | 'gameover' | 'win'
let keysDown = {};

// ─── Brick Initialization ───────────────────────────────────
function initBricks() {
    bricks = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
        bricks[r] = [];
        for (let c = 0; c < BRICK_COLS; c++) {
            bricks[r][c] = {
                x: BRICK_OFFSET_LEFT + c * (BRICK_WIDTH + BRICK_PADDING),
                y: BRICK_OFFSET_TOP + r * (BRICK_HEIGHT + BRICK_PADDING),
                color: BRICK_COLORS[r],
                alive: true
            };
        }
    }
}

// ─── Reset Functions ────────────────────────────────────────
function resetBall() {
    ballX = CANVAS_WIDTH / 2;
    ballY = PADDLE_Y - BALL_RADIUS;
    const angle = (Math.random() * 0.5 + 0.25) * Math.PI / 2; // 45° ± variation
    const speed = INITIAL_SPEED;
    ballVX = speed * Math.cos(Math.PI / 2 - angle);
    ballVY = -speed * Math.sin(Math.PI / 2 - angle);
}

function resetGame() {
    paddleX = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
    score = 0;
    lives = 3;
    gameState = 'playing';
    initBricks();
    resetBall();
}

// ─── Input ──────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
    keysDown[e.key.toLowerCase()] = true;
    keysDown[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keysDown[e.key.toLowerCase()] = false;
    keysDown[e.key] = false;
});

// ─── Update ─────────────────────────────────────────────────
function update() {
    if (gameState !== 'playing') return;

    // ── Paddle movement ──
    const paddleSpeed = 7;
    if (keysDown['ArrowLeft'] || keysDown['a'] || keysDown['q']) {
        paddleX -= paddleSpeed;
    }
    if (keysDown['ArrowRight'] || keysDown['d'] || keysDown['s']) {
        paddleX += paddleSpeed;
    }
    paddleX = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, paddleX));

    // ── Ball movement ──
    ballX += ballVX;
    ballY += ballVY;

    // ── Wall collisions ──
    if (ballX - BALL_RADIUS <= 0) {
        ballX = BALL_RADIUS;
        ballVX = Math.abs(ballVX);
    }
    if (ballX + BALL_RADIUS >= CANVAS_WIDTH) {
        ballX = CANVAS_WIDTH - BALL_RADIUS;
        ballVX = -Math.abs(ballVX);
    }
    if (ballY - BALL_RADIUS <= 0) {
        ballY = BALL_RADIUS;
        ballVY = Math.abs(ballVY);
    }

    // ── Bottom collision (lose life) ──
    if (ballY + BALL_RADIUS >= CANVAS_HEIGHT) {
        lives--;
        if (lives <= 0) {
            gameState = 'gameover';
        } else {
            resetBall();
        }
        return;
    }

    // ── Paddle collision ──
    if (
        ballY + BALL_RADIUS >= PADDLE_Y &&
        ballY + BALL_RADIUS <= PADDLE_Y + PADDLE_HEIGHT + 5 &&
        ballX >= paddleX &&
        ballX <= paddleX + PADDLE_WIDTH
    ) {
        // Calculate impact offset (-1 left edge, 0 center, +1 right edge)
        const impact = (ballX - (paddleX + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
        // Clamp to [-1, 1]
        const clampedImpact = Math.max(-0.9, Math.min(0.9, impact));
        // New angle from -75° to +75°
        const angle = clampedImpact * (Math.PI / 2.5);
        const speed = Math.sqrt(ballVX * ballVX + ballVY * ballVY);
        ballVX = speed * Math.sin(angle);
        ballVY = -speed * Math.cos(angle);
        ballY = PADDLE_Y - BALL_RADIUS;
    }

    // ── Brick collision ──
    for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLS; c++) {
            const brick = bricks[r][c];
            if (!brick.alive) continue;

            if (
                ballX + BALL_RADIUS > brick.x &&
                ballX - BALL_RADIUS < brick.x + BRICK_WIDTH &&
                ballY + BALL_RADIUS > brick.y &&
                ballY - BALL_RADIUS < brick.y + BRICK_HEIGHT
            ) {
                brick.alive = false;
                score += 10;

                // Determine bounce direction
                const overlapLeft = (ballX + BALL_RADIUS) - brick.x;
                const overlapRight = (brick.x + BRICK_WIDTH) - (ballX - BALL_RADIUS);
                const overlapTop = (ballY + BALL_RADIUS) - brick.y;
                const overlapBottom = (brick.y + BRICK_HEIGHT) - (ballY - BALL_RADIUS);

                const minOverlapX = Math.min(overlapLeft, overlapRight);
                const minOverlapY = Math.min(overlapTop, overlapBottom);

                if (minOverlapX < minOverlapY) {
                    ballVX = -ballVX;
                } else {
                    ballVY = -ballVY;
                }

                // Check win condition
                if (isAllBricksDestroyed()) {
                    gameState = 'win';
                }
                break;
            }
        }
        if (gameState !== 'playing') break;
    }
}

function isAllBricksDestroyed() {
    for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLS; c++) {
            if (bricks[r][c].alive) return false;
        }
    }
    return true;
}

// ─── Draw ───────────────────────────────────────────────────
function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // ── Bricks ──
    for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLS; c++) {
            const brick = bricks[r][c];
            if (!brick.alive) continue;

            ctx.fillStyle = brick.color;
            ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);

            // Subtle border
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.lineWidth = 1;
            ctx.strokeRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
        }
    }

    // ── Paddle ──
    ctx.fillStyle = '#ecf0f1';
    ctx.shadowColor = 'rgba(255,255,255,0.3)';
    ctx.shadowBlur = 10;
    ctx.fillRect(paddleX, PADDLE_Y, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.shadowBlur = 0;

    // ── Ball ──
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.closePath();

    // Ball glow
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_RADIUS + 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    // ── HUD ──
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 15, 30);
    ctx.textAlign = 'right';
    ctx.fillText(`Vies: ${lives}`, CANVAS_WIDTH - 15, 30);

    // ── Game Over / Win overlay ──
    if (gameState === 'gameover') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.fillText(`Score final: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
        ctx.fillText('Appuyez sur ESPACE pour recommencer', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 70);
    }

    if (gameState === 'win') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = '#2ecc71';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('VICTOIRE !', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.fillText(`Score final: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
        ctx.fillText('Appuyez sur ESPACE pour recommencer', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 70);
    }
}

// ─── Game Loop ──────────────────────────────────────────────
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// ─── Space key to restart ───────────────────────────────────
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && (gameState === 'gameover' || gameState === 'win')) {
        resetGame();
    }
});

// ─── Start ──────────────────────────────────────────────────
initBricks();
resetBall();
gameLoop();