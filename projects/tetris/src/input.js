```javascript
class InputHandler {
  constructor(callbacks) {
    this._callbacks = callbacks || {};
    this._keysDown = new Set();
    this._moveInterval = null;
    this._softDropInterval = null;
    this._moveTimeout = null;
    this._softDropTimeout = null;
    this._moveDelay = 150;
    this._moveRepeat = 50;
    this._softDropDelay = 50;
    this._softDropRepeat = 50;

    document.addEventListener('keydown', (e) => this._onKeyDown(e));
    document.addEventListener('keyup', (e) => this._onKeyUp(e));
  }

  _onKeyDown(e) {
    const key = e.key;

    if (this._keysDown.has(key)) return;
    this._keysDown.add(key);

    switch (key) {
      case 'ArrowLeft':
        this._callbacks.onMove?.(-1);
        this._startMoveRepeat(-1);
        break;
      case 'ArrowRight':
        this._callbacks.onMove?.(1);
        this._startMoveRepeat(1);
        break;
      case 'ArrowDown':
        this._callbacks.onSoftDrop?.();
        this._startSoftDropRepeat();
        break;
      case 'ArrowUp':
        this._callbacks.onRotate?.();
        break;
      case ' ':
        e.preventDefault();
        this._callbacks.onHardDrop?.();
        break;
      case 'p':
      case 'P':
        this._callbacks.onPause?.();
        break;
    }

    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', ' '].includes(key)) {
      e.preventDefault();
    }
  }

  _onKeyUp(e) {
    this._keysDown.delete(e.key);

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowRight':
        this._stopMoveRepeat();
        break;
      case 'ArrowDown':
        this._stopSoftDropRepeat();
        break;
    }
  }

  _startMoveRepeat(direction) {
    this._stopMoveRepeat();
    this._moveTimeout = setTimeout(() => {
      this._moveInterval = setInterval(() => {
        this._callbacks.onMove?.(direction);
      }, this._moveRepeat);
    }, this._moveDelay);
  }

  _stopMoveRepeat() {
    clearTimeout(this._moveTimeout);
    this._moveTimeout = null;
    clearInterval(this._moveInterval);
    this._moveInterval = null;
  }

  _startSoftDropRepeat() {
    this._stopSoftDropRepeat();
    this._softDropTimeout = setTimeout(() => {
      this._softDropInterval = setInterval(() => {
        this._callbacks.onSoftDrop?.();
      }, this._softDropRepeat);
    }, this._softDropDelay);
  }

  _stopSoftDropRepeat() {
    clearTimeout(this._softDropTimeout);
    this._softDropTimeout = null;
    clearInterval(this._softDropInterval);
    this._softDropInterval = null;
  }

  destroy() {
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
    this._stopMoveRepeat();
    this._stopSoftDropRepeat();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { InputHandler };
}
```
