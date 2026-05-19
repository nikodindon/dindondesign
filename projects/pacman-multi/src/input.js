const keys = {};

export function initInput() {
  window.addEventListener('keydown', e => keys[e.code] = true);
  window.addEventListener('keyup', e => keys[e.code] = false);
}

export function isUpPressed() {
  return keys['ArrowUp'] || keys['KeyW'];
}

export function isDownPressed() {
  return keys['ArrowDown'] || keys['KeyS'];
}

export function isLeftPressed() {
  return keys['ArrowLeft'] || keys['KeyA'];
}

export function isRightPressed() {
  return keys['ArrowRight'] || keys['KeyD'];
}