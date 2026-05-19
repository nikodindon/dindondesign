# SNAKE - SPECIFICATION COMPLETE

## Overview
Classic Snake game. Player controls snake, eats food, grows, avoids walls/self.

## Game Constants
- CANVAS_WIDTH=400, CANVAS_HEIGHT=400
- GRID_SIZE=20
- INITIAL_SNAKE_LENGTH=3
- INITIAL_SPEED=100 (ms per frame)

## Controls (input.js)
- Arrow keys: Up, Down, Left, Right
- WASD alternative
- Space/Enter: restart after game over
- Export: initInput(), isUp/Down/Left/Right/Restart()

## Game Logic (game.js)
- State: snake[], food, direction, nextDirection, score, gameOver
- update(): move snake, check collisions, eat food, grow
- draw(): clear canvas, draw snake (green), draw food (red), score
- Game loop with requestAnimationFrame
- Screen wrap: NO (game over on wall hit)

## UI (index.html + style.css)
- Canvas centered, dark theme (#111 bg)
- Score display above canvas
- Game over message with restart hint
- Simple, clean styling