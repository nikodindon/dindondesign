// input.js
let isUp = false;
let isDown = false;
let isLeft = false;
let isRight = false;
let isRestart = false;

export function initInput() {
    document.addEventListener('keydown', (e) => {
        switch (e.code) {
            case 'ArrowUp':
            case 'KeyW':
                isUp = true;
                e.preventDefault();
                break;
            case 'ArrowDown':
            case 'KeyS':
                isDown = true;
                e.preventDefault();
                break;
            case 'ArrowLeft':
            case 'KeyA':
                isLeft = true;
                e.preventDefault();
                break;
            case 'ArrowRight':
            case 'KeyD':
                isRight = true;
                e.preventDefault();
                break;
            case 'Enter':
            case 'Space':
                isRestart = true;
                break;
        }
    });

    document.addEventListener('keyup', (e) => {
        switch (e.code) {
            case 'ArrowUp':
            case 'KeyW': isUp = false; break;
            case 'ArrowDown':
            case 'KeyS': isDown = false; break;
            case 'ArrowLeft':
            case 'KeyA': isLeft = false; break;
            case 'ArrowRight':
            case 'KeyD': isRight = false; break;
        }
    });
}

export function isUpPressed() { return isUp; }
export function isDownPressed() { return isDown; }
export function isLeftPressed() { return isLeft; }
export function isRightPressed() { return isRight; }

export function isRestartPressed() {
    if (isRestart) {
        isRestart = false;
        return true;
    }
    return false;
}