let keysDown = {};

function initInput() {
  window.addEventListener('keydown', (e) => {
    keysDown[e.code] = true;
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
      e.preventDefault();
    }
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

export { initInput, isLeftPressed, isRightPressed, keysDown };