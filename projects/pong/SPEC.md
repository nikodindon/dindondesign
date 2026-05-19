# PONG - SPECIFICATION COMPLETE

## Overview
Classic single-player Pong. Player controls left paddle, AI controls right paddle. Score points when opponent misses.

## Contrôles
- **Player paddle**: Flèche HAUT/BAS ou W/S (Q/Z en AZERTY)
- **Restart**: ESPACE après game over

## Fichiers à créer (3 fichiers)

### 1. index.html + style.css
- Canvas 800x500 id="gameCanvas"
- Titre "PONG" centré en haut
- Score display: left player vs right AI
- Style: noir background, bordure blanche, texte blanc

### 2. input.js
ES6 module exportant:
- initInput()
- isUpPressed() - ArrowUp, KeyW, KeyZ
- isDownPressed() - ArrowDown, KeyS, KeyW

### 3. game.js
CONSTANTS:
- CANVAS_WIDTH = 800
- CANVAS_HEIGHT = 500
- PADDLE_WIDTH = 15
- PADDLE_HEIGHT = 100
- BALL_SIZE = 10
- PLAYER_SPEED = 7
- AI_SPEED = 4
- BALL_SPEED = 6

Game state:
- playerY, aiY (paddle positions)
- ballX, ballY, ballVX, ballVY
- playerScore, aiScore

Gameplay:
- Player paddle: moves with keys, constrained to canvas
- AI paddle: follows ballY with speed limit
- Ball: bounces on top/bottom walls, paddles
- Score: ball goes past paddle, reset ball
- Win: first to 5 wins

Draw:
- White rectangles for paddles
- White square for ball
- White lines for net (dashed center line)
- Score text centered