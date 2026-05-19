<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Asteroids</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <script src="input.js"></script>
    <script src="game.js"></script>
</body>
</html>
```

```javascript
// game.js — Asteroids

// ─── Import input module ───────────────────────────────────────
// Expected input.js exports:
//   input.isDown(keyCode)  → boolean
//   input.keys             → Set of currently pressed key codes
//   input.init(canvas)     → called once to bind listeners

// ─── Constants ─────────────────────────────────────────────────
const SHIP_SIZE            = 20;
const SHIP_THRUST          = 0.15;
const SHIP_FRICTION        = 0.98;
const SHIP_ROTATION        = 0.08;
const BULLET_SPEED         = 8;
const BULLET_LIFETIME      = 60;
const BULLET_COOLDOWN      = 15;
const ASTEROID_SPEED_MIN   = 1;
const ASTEROID_SPEED_MAX   = 3;
const ASTEROID_SIZE_LARGE  = 40;
const ASTEROID_SIZE_MEDIUM = 25;
const ASTEROID_SIZE_SMALL  = 15;
const EXTRA_LIFE_SCORE     = 5000;

// ─── Canvas Setup ──────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
const W = canvas.width;   // 800
const H = canvas.height;  // 600

// ─── Input ─────────────────────────────────────────────────────
input.init(canvas);

// ─── Game State ────────────────────────────────────────────────
let ship, bullets, asteroids, particles;
let score, lives, level, gameState, bulletCooldown, extraLifeCount;

const STATE_TITLE    = 'title';
const STATE_PLAYING  = 'playing';
const STATE_GAMEOVER = 'gameover';

// ─── Helpers ───────────────────────────────────────────────────
function rand(min, max) {
    return Math.random() * (max - min) + min;
}

function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
}

function dist(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

function wrap(obj) {
    if (obj.x < -50) obj.x = W + 50;
    if (obj.x > W + 50) obj.x = -50;
    if (obj.y < -50) obj.y = H + 50;
    if (obj.y > H + 50) obj.y = -50;
}

// ─── Asteroid Polygon Generation ───────────────────────────────
function asteroidVertices(size) {
    const verts = [];
    const numVerts = randInt(7, 12);
    for (let i = 0; i < numVerts; i++) {
        const angle = (Math.PI * 2 / numVerts) * i;
        const r = size * rand(0.7, 1.3);
        verts.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
    }
    return verts;
}

// ─── Ship ──────────────────────────────────────────────────────
function createShip() {
    return {
        x: W / 2,
        y: H / 2,
        vx: 0,
        vy: 0,
        angle: -Math.PI / 2,   // pointing up
        thrusting: false,
        invincibleTimer: 0,
        blinkTimer: 0
    };
}

function drawShip() {
    if (ship.invincibleTimer > 0) {
        ship.blinkTimer++;
        if (Math.floor(ship.blinkTimer / 4) % 2 === 0) return; // blink effect
    }

    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.angle);

    // Main triangle body
    ctx.beginPath();
    ctx.moveTo(SHIP_SIZE, 0);
    ctx.lineTo(-SHIP_SIZE * 0.7, -SHIP_SIZE * 0.5);
    ctx.lineTo(-SHIP_SIZE * 0.4, 0);  // engine notch
    ctx.lineTo(-SHIP_SIZE * 0.7, SHIP_SIZE * 0.5);
    ctx.closePath();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Thrust flame
    if (ship.thrusting) {
        const flameLen = rand(8, 16);
        ctx.beginPath();
        ctx.moveTo(-SHIP_SIZE * 0.4, 0);
        ctx.lineTo(-SHIP_SIZE * 0.7 - flameLen, -SHIP_SIZE * 0.25);
        ctx.lineTo(-SHIP_SIZE * 0.7 - flameLen, SHIP_SIZE * 0.25);
        ctx.closePath();
        ctx.strokeStyle = '#ff8800';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    ctx.restore();
}

function updateShip() {
    // Rotation
    if (input.isDown(37)) {          // Left Arrow
        ship.angle -= SHIP_ROTATION;
    }
    if (input.isDown(39)) {          // Right Arrow
        ship.angle += SHIP_ROTATION;
    }

    // Thrust
    ship.thrusting = input.isDown(38); // Up Arrow
    if (ship.thrusting) {
        ship.vx += Math.cos(ship.angle) * SHIP_THRUST;
        ship.vy += Math.sin(ship.angle) * SHIP_THRUST;

        // Thrust particles
        if (Math.random() < 0.5) {
            const px = ship.x - Math.cos(ship.angle) * SHIP_SIZE * 0.5;
            const py = ship.y - Math.sin(ship.angle) * SHIP_SIZE * 0.5;
            particles.push({
                x: px, y: py,
                vx: px < ship.x ? rand(-1, -0.3) : rand(0.3, 1),
                vy: rand(-0.5, 0.5),
                life: randInt(8, 15),
                maxLife: 15,
                color: '#ff6600',
                size: rand(1.5, 3)
            });
        }
    }

    // Friction (space friction — slow decay)
    ship.vx *= SHIP_FRICTION;
    ship.vy *= SHIP_FRICTION;

    // Position update
    ship.x += ship.vx;
    ship.y += ship.vy;

    // Screen wrap
    if (ship.x < 0) ship.x = W;
    if (ship.x > W) ship.x = 0;
    if (ship.y < 0) ship.y = H;
    if (ship.y > H) ship.y = 0;

    // Invincibility countdown
    if (ship.invincibleTimer > 0) {
        ship.invincibleTimer--;
    }
}

function fireBullet() {
    if (bulletCooldown > 0) return;

    bullets.push({
        x: ship.x + Math.cos(ship.angle) * SHIP_SIZE,
        y: ship.y + Math.sin(ship.angle) * SHIP_SIZE,
        vx: Math.cos(ship.angle) * BULLET_SPEED + ship.vx * 0.3,
        vy: Math.sin(ship.angle) * BULLET_SPEED + ship.vy * 0.3,
        life: BULLET_LIFETIME
    });

    bulletCooldown = BULLET_COOLDOWN;
}

// ─── Bullets ───────────────────────────────────────────────────
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx;
        b.y += b.vy;
        b.life--;

        // Screen wrap
        if (b.x < 0) b.x = W;
        if (b.x > W) b.x = 0;
        if (b.y < 0) b.y = H;
        if (b.y > H) b.y = 0;

        if (b.life <= 0) {
            bullets.splice(i, 1);
        }
    }
}

function drawBullets() {
    for (const b of bullets) {
        const alpha = Math.min(1, b.life / 10);
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

// ─── Asteroids ─────────────────────────────────────────────────
function spawnAsteroid(x, y, size) {
    const angle = rand(0, Math.PI * 2);
    const speed = rand(ASTEROID_SPEED_MIN, ASTEROID_SPEED_MAX);
    return {
        x: x ?? rand(50, W - 50),
        y: y ?? rand(50, H - 50),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: size,
        verts: asteroidVertices(size),
        rotation: rand(-0.02, 0.02),
        rotationAngle: 0
    };
}

function spawnAsteroidField() {
    asteroids = [];
    const count = 3 + level; // harder each level
    for (let i = 0; i < count; i++) {
        const a = spawnAsteroid(undefined, undefined, ASTEROID_SIZE_LARGE);
        // Make sure it doesn't spawn on top of the ship
        while (dist(a.x, a.y, ship.x, ship.y) < 150) {
            a.x = rand(50, W - 50);
            a.y = rand(50, H - 50);
        }
        asteroids.push(a);
    }
}

function updateAsteroids() {
    for (const a of asteroids) {
        a.x += a.vx;
        a.y += a.vy;
        a.rotationAngle += a.rotation;

        if (a.x < -60) a.x = W + 60;
        if (a.x > W + 60) a.x = -60;
        if (a.y < -60) a.y = H + 60;
        if (a.y > H + 60) a.y = -60;
    }
}

function drawAsteroids() {
    for (const a of asteroids) {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rotationAngle);
        ctx.beginPath();
        ctx.moveTo(a.verts[0].x, a.verts[0].y);
        for (let i = 1; i < a.verts.length; i++) {
            ctx.lineTo(a.verts[i].x, a.verts[i].y);
        }
        ctx.closePath();
        ctx.strokeStyle = '#aaaaaa';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
    }
}

// ─── Particles ─────────────────────────────────────────────────
function spawnExplosion(x, y, count, color, sizeRange) {
    for (let i = 0; i < count; i++) {
        const angle = rand(0, Math.PI * 2);
        const speed = rand(0.5, 3);
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: randInt(15, 40),
            maxLife: 40,
            color: color || '#ffffff',
            size: rand(sizeRange[0] || 1, sizeRange[1] || 3)
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life--;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    for (const p of particles) {
        const alpha = Math.max(0, p.life / p.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
}

// ─── Collision Detection ───────────────────────────────────────
function checkCollisions() {
    // Bullet-Asteroid collisions
    for (let bi = bullets.length - 1; bi >= 0; bi--) {
        const b = bullets[bi];
        for (let ai = asteroids.length - 1; ai >= 0; ai--) {
            const a = asteroids[ai];
            const asteroidRadius = a.size;

            if (dist(b.x, b.y, a.x, a.y) < asteroidRadius) {
                // Hit!
                bullets.splice(bi, 1);

                // Score based on asteroid size
                let points = 0;
                if (a.size === ASTEROID_SIZE_LARGE)  points = 20;
                if (a.size === ASTEROID_SIZE_MEDIUM) points = 50;
                if (a.size === ASTEROID_SIZE_SMALL)  points = 100;
                score += points;

                // Check for extra life
                if (Math.floor(score / EXTRA_LIFE_SCORE) > extraLifeCount) {
                    extraLifeCount++;
                    lives++;
                    spawnExplosion(ship.x, ship.y, 30, '#00ff88', [3, 6]);
                }

                // Split asteroid
                if (a.size === ASTEROID_SIZE_LARGE) {
                    for (let s = 0; s < 2; s++) {
                        asteroids.push(spawnAsteroid(a.x, a.y, ASTEROID_SIZE_MEDIUM));
                    }
                } else if (a.size === ASTEROID_SIZE_MEDIUM) {
                    for (let s = 0; s < 2; s++) {
                        asteroids.push(spawnAsteroid(a.x, a.y, ASTEROID_SIZE_SMALL));
                    }
                }

                // Explosion particles
                spawnExplosion(a.x, a.y, 12, '#cccccc', [2, 5]);
                spawnExplosion(a.x, a.y, 6, '#ffaa44', [1, 3]);

                asteroids.splice(ai, 1);
                break;
            }
        }
    }

    // Ship-Asteroid collisions
    if (ship.invincibleTimer <= 0) {
        for (const a of asteroids) {
            if (dist(ship.x, ship.y, a.x, a.y) < a.size + SHIP_SIZE * 0.5) {
                // Ship destroyed
                lives--;
                spawnExplosion(ship.x, ship.y, 40, '#ff4444', [2, 6]);
                spawnExplosion(ship.x, ship.y, 20, '#ffaa00', [1, 4]);

                if (lives <= 0) {
                    gameState = STATE_GAMEOVER;
                } else {
                    // Respawn ship
                    ship.x = W / 2;
                    ship.y = H / 2;
                    ship.vx = 0;
                    ship.vy = 0;
                    ship.invincibleTimer = 120; // 2 seconds at 60fps
                }
                break;
            }
        }
    }
}

// ─── Level Management ──────────────────────────────────────────
function checkLevelComplete() {
    if (asteroids.length === 0 && gameState === STATE_PLAYING) {
        level++;
        spawnAsteroidField();
    }
}

// ─── HUD Drawing ───────────────────────────────────────────────
function drawHUD() {
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${score}`, 15, 30);
    ctx.fillText(`LEVEL: ${level}`, 15, 55);

    // Lives as small ship icons
    ctx.textAlign = 'right';
    ctx.fillText('LIVES:', W - 80, 30);
    for (let i = 0; i < lives; i++) {
        ctx.save();
        ctx.translate(W - 65 + i * 22, 25);
        ctx.rotate(-Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(SHIP_SIZE * 0.4, 0);
        ctx.lineTo(-SHIP_SIZE * 0.3, -SHIP_SIZE * 0.3);
        ctx.lineTo(-SHIP_SIZE * 0.2, 0);
        ctx.lineTo(-SHIP_SIZE * 0.3, SHIP_SIZE * 0.3);
        ctx.closePath();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    }
}

function drawTitleScreen() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 60px monospace';
    ctx.fillText('ASTEROIDS', W / 2, H / 2 - 60);

    ctx.font = '20px monospace';
    ctx.fillText('← → ROTATE    ↑ THRUST    SPACE FIRE', W / 2, H / 2 + 10);

    ctx.font = '16px monospace';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText('PRESS SPACE TO START', W / 2, H / 2 + 60);

    ctx.fillStyle = '#666666';
    ctx.fillText(`HIGH SCORE: ${score}`, W / 2, H / 2 + 100);
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#ff4444';
    ctx.textAlign = 'center';
    ctx.font = 'bold 50px monospace';
    ctx.fillText('GAME OVER', W / 2, H / 2 - 30);

    ctx.fillStyle = '#ffffff';
    ctx.font = '24px monospace';
    ctx.fillText(`FINAL SCORE: ${score}`, W / 2, H / 2 + 20);

    ctx.fillStyle = '#aaaaaa';
    ctx.font = '18px monospace';
    ctx.fillText('PRESS SPACE TO RESTART', W / 2, H / 2 + 60);
}

// ─── Init / Reset ──────────────────────────────────────────────
function initGame() {
    ship          = createShip();
    bullets       = [];
    asteroids     = [];
    particles     = [];
    score         = 0;
    lives         = 3;
    level         = 1;
    bulletCooldown = 0;
    extraLifeCount = 0;
    gameState     = STATE_TITLE;
}

function startPlaying() {
    gameState = STATE_PLAYING;
    ship      = createShip();
    bullets   = [];
    particles = [];
    bulletCooldown = 0;
    spawnAsteroidField();
}

// ─── Main Game Loop ────────────────────────────────────────────
function update() {
    if (gameState === STATE_TITLE) {
        if (input.isDown(32)) { // Space
            score = 0;
            lives = 3;
            level = 1;
            startPlaying();
        }
    } else if (gameState === STATE_PLAYING) {
        updateShip();
        updateBullets();
        updateAsteroids();
        updateParticles();

        if (input.isDown(32)) { // Space
            fireBullet();
        }

        if (bulletCooldown > 0) bulletCooldown--;

        checkCollisions();
        checkLevelComplete();
    } else if (gameState === STATE_GAMEOVER) {
        updateParticles();
        if (input.isDown(32)) {
            initGame(); // resets to title, then space starts
            gameState = STATE_TITLE;
        }
    }
}

function draw() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);

    if (gameState === STATE_TITLE) {
        drawTitleScreen();
        drawParticles();
    } else if (gameState === STATE_PLAYING) {
        drawParticles();
        drawAsteroids();
        drawBullets();
        drawShip();
        drawHUD();
    } else if (gameState === STATE_GAMEOVER) {
        drawParticles();
        drawAsteroids();
        drawBullets();
        drawShip();
        drawHUD();
        drawGameOver();
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// ─── Start ─────────────────────────────────────────────────────
initGame();
gameLoop();
```

## What's included

| Feature | Details |
|---|---|
| **Ship** | Triangle drawn with `ctx.lineTo`, rotates with ←/→, thrusts with ↑ (includes flame particle effect) |
| **Bullets** | Fired with SPACE, cooldown timer, lifetime expiry, travel at `BULLET_SPEED`, inherit partial ship velocity |
| **Asteroids** | Jagged polygon with 7–12 randomized vertices, 3 sizes — large splits into 2 medium, medium splits into 2 small |
| **Particles** | Explosion sparks on asteroid destruction and ship death, thrust trail particles, fade out over `life` frames |
| **Collisions** | Circle-based distance checks for bullet↔asteroid and ship↔asteroid |
| **Screen wrap** | All entities (ship, bullets, asteroids) wrap across all 4 edges |
| **Leveling** | Each level spawns `3 + level` asteroids; asteroids don't spawn near the ship |
| **Extra life** | Awarded every `5000` points, with a green explosion indicator |
| **HUD** | Score, level, and live ship icons in the corners |
| **Screens** | Title → Playing → Game Over, all space-triggered |
| **Invincibility** | 2-second blink-period after respawning so you don't immediately re-kill yourself |

### Assumed `input.js` API

The code expects `input.js` to provide:

```javascript
const input = {
    keys: new Set(),
    init(canvas) { /* binds keydown/keyup to add/remove from keys */ },
    isDown(code) { return this.keys.has(code); }
};
```

Where key codes are standard: `37`=Left, `38`=Up, `39`=Right, `32`=Space.