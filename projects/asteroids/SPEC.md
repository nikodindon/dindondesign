# ASTEROIDS - SPECIFICATION COMPLETE

## Overview
Classic single-player Asteroids. Player controls a spaceship, destroys asteroids, avoids collisions. Score points, extra life every 5000 points.

## Contrôles
- **Rotation**: Flèches GAUCHE/DROITE ou A/D (Q/W en AZERTY)
- **Thrust**: Flèche HAUT ou W (Z en AZERTY)
- **Fire**: ESPACE

## Fichiers à créer

### 1. index.html
```html
<!DOCTYPE html>
<html>
<head>
  <title>ASTEROIDS</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="game-container">
    <h1>ASTEROIDS</h1>
    <div id="hud">
      <span>SCORE: <span id="score">0</span></span>
      <span>LIVES: <span id="lives">3</span></span>
      <span>LEVEL: <span id="level">1</span></span>
    </div>
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <div id="message"></div>
  </div>
  <script type="module" src="game.js"></script>
</body>
</html>
```

### 2. style.css
- Body: noir, font 'Courier New', centered
- Canvas: 800x600, border blanche 2px, background #000
- HUD: flexbox, couleur blanche, 18px, entre score et lives
- Message: overlay centré pour GAME OVER / PRESS SPACE
- Effet glow sur titre (text-shadow cyan)

### 3. input.js (23 lignes)
```javascript
let keysDown = {};

function initInput() {
  window.addEventListener('keydown', (e) => {
    keysDown[e.code] = true;
    if (e.code === 'Space') e.preventDefault();
  });
  window.addEventListener('keyup', (e) => {
    keysDown[e.code] = false;
  });
}

function isLeftPressed() {
  return keysDown['ArrowLeft'] || keysDown['KeyA'] || keysDown['KeyQ'];
}
function isRightPressed() {
  return keysDown['ArrowRight'] || keysDown['KeyD'] || keysDown['KeyW'];
}
function isThrustPressed() {
  return keysDown['ArrowUp'] || keysDown['KeyW'] || keysDown['KeyZ'];
}
function isFirePressed() {
  return keysDown['Space'];
}
function wasFirePressed() {
  // fire une seule fois par pression
  if (keysDown['Space'] && !keysDown['_fireLocked']) {
    keysDown['_fireLocked'] = true;
    return true;
  }
  if (!keysDown['Space']) keysDown['_fireLocked'] = false;
  return false;
}

export { initInput, isLeftPressed, isRightPressed, isThrustPressed, wasFirePressed };
```

### 4. game.js (300+ lignes)

## CONSTANTS
```javascript
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const SHIP_SIZE = 20;          // triangle size
const SHIP_THRUST = 0.15;      // acceleration
const SHIP_FRICTION = 0.98;    // friction coefficient
const SHIP_ROTATION = 0.08;    // radians per frame
const BULLET_SPEED = 8;
const BULLET_LIFETIME = 60;     // frames
const BULLET_COOLDOWN = 15;    // frames between shots
const ASTEROID_SPEED_MIN = 1;
const ASTEROID_SPEED_MAX = 3;
const ASTEROID_SIZE_LARGE = 40;
const ASTEROID_SIZE_MEDIUM = 25;
const ASTEROID_SIZE_SMALL = 15;
const ASTEROID_VERTICES = 10;  // irregular polygon
const EXTRA_LIFE_SCORE = 5000;
```

## GAME STATE
```javascript
let ship = {
  x: CANVAS_WIDTH / 2,
  y: CANVAS_HEIGHT / 2,
  vx: 0,
  vy: 0,
  rotation: -Math.PI / 2,  // point up
  radius: SHIP_SIZE,
  alive: true,
  invulnerable: 120  // frames of invincibility after spawn
};

let bullets = [];      // {x, y, vx, vy, life}
let asteroids = [];    // {x, y, vx, vy, size, vertices, rotation, rotationSpeed}
let particles = [];    // {x, y, vx, vy, life, color} pour explosions

let score = 0;
let lives = 3;
let level = 1;
let gameState = 'playing';  // 'playing', 'gameover', 'levelTransition'
let lastFireTime = 0;
```

## FONCTIONS REQUISES

### initGame()
- Reset ship, bullets, asteroids
- Score = 0, lives = 3, level = 1
- Spawn initial asteroids

### spawnAsteroids(count, size)
- count: nombre d'asteroids
- size: 'large', 'medium', 'small'
- Position: edges de l'écran (pas sur le joueur)
- Forme: polygon irregular (vertices + noise)

### update()
- Si gameState !== 'playing' return

**Ship:**
- Rotation: isLeftPressed() → rotation -= SHIP_ROTATION
- Rotation: isRightPressed() → rotation += SHIP_ROTATION
- Thrust: isThrustPressed() → vx += cos(rotation)*SHIP_THRUST, vy += sin(rotation)*SHIP_THRUST
- Apply friction: vx *= SHIP_FRICTION, vy *= SHIP_FRICTION
- Update position: x += vx, y += vy
- Screen wrap: if x < 0 x = CANVAS_WIDTH, etc.

**Bullets:**
- Fire: wasFirePressed() &&bullets.length < 5 && now-lastFireTime > BULLET_COOLDOWN
- Spawn à ship tip: x + cos(rotation)*RADIUS, y + sin(rotation)*RADIUS
- Update: x += vx, y += vy
- Wrap screen
- Decrement life, supprimer si 0

**Asteroids:**
- Update: x += vx, y += vy
- Wrap screen
- Rotation: rotation += rotationSpeed

**Collisions:**
- Bullet vs Asteroid: distance < asteroid.radius
  - Destroy bullet, destroy asteroid
  - +100 (large), +50 (medium), +20 (small)
  - Spawn smaller asteroids si large/medium (2x smaller)
  - Spawn particles (10)
- Ship vs Asteroid: distance < ship.radius + asteroid.radius
  - Si invulnerable > 0, ignore
  - Destroy ship, lives--
  - Spawn particles (20)
  - Si lives > 0: respawn ship après 60 frames
  - Si lives == 0: gameState = 'gameover'

**Level Complete:**
- Si asteroids.length == 0
  - level++, spawnAsteroids(4 + level, 'large')

**Extra Life:**
- Si score >= nextExtraLifeScore
  - lives++, nextExtraLifeScore += EXTRA_LIFE_SCORE

### draw()
- Clear canvas noir
- Draw particles (fade out)
- Draw asteroids (polygon blanc, stroke only)
- Draw bullets (points blancs)
- Draw ship (triangle blanc, stroke only)
  - Si invulnerable: blink ou transparency

## Screen Wrap Function
```javascript
function wrapPosition(obj) {
  if (obj.x < 0) obj.x = CANVAS_WIDTH;
  if (obj.x > CANVAS_WIDTH) obj.x = 0;
  if (obj.y < 0) obj.y = CANVAS_HEIGHT;
  if (obj.y > CANVAS_HEIGHT) obj.y = 0;
}
```

## Polygon Draw (Asteroids)
```javascript
function drawPolygon(ctx, x, y, radius, vertices, rotation) {
  ctx.beginPath();
  for (let i = 0; i < vertices.length; i++) {
    const angle = rotation + (i / vertices.length) * Math.PI * 2;
    const px = x + Math.cos(angle) * vertices[i];
    const py = y + Math.sin(angle) * vertices[i];
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
}
```

## Game Loop
```javascript
function gameLoop(timestamp) {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
```

## Dépendances fichiers
- game.js import: input.js (ES6 modules)
- game.js export: nothing (global)
- HTML import: game.js comme module

## Notes importantes
- Pas de son (trop complexe)
- Invulnerability après respawn pour éviter death instantanée
- Level progressif: +1 asteroid par niveau
- Screen wrap obligatoire pour TOUT (ship, bullets, asteroids)