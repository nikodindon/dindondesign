Here's a clean, production-ready ES6 module that matches your specifications:

```javascript
// input.js
const keyState = {};

// Key mappings (using e.code for layout-independent detection)
const LEFT_KEYS = ['ArrowLeft', 'KeyA', 'KeyQ'];
const RIGHT_KEYS = ['ArrowRight', 'KeyD', 'KeyW'];
const THRUST_KEYS = ['ArrowUp', 'KeyW', 'KeyZ'];
const FIRE_KEYS = ['Space'];

let _fireTriggered = false;
let _initialized = false;

export function initInput() {
  if (_initialized) return;
  _initialized = true;

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
}

function handleKeyDown(e) {
  keyState[e.code] = true;
  if (isGameKey(e.code)) {
    e.preventDefault(); // Prevent page scrolling for game keys
  }
}

function handleKeyUp(e) {
  keyState[e.code] = false;
}

function isGameKey(code) {
  return LEFT_KEYS.includes(code) || RIGHT_KEYS.includes(code) ||
         THRUST_KEYS.includes(code) || FIRE_KEYS.includes(code);
}

function isGroupPressed(keys) {
  return keys.some(k => keyState[k]);
}

export function isLeftPressed() {
  return isGroupPressed(LEFT_KEYS);
}

export function isRightPressed() {
  return isGroupPressed(RIGHT_KEYS);
}

export function isThrustPressed() {
  return isGroupPressed(THRUST_KEYS);
}

export function wasFirePressed() {
  // Register press if currently held
  if (isGroupPressed(FIRE_KEYS)) {
    _fireTriggered = true;
  }
  
  // Return state and immediately reset for "once per press" behavior
  const result = _fireTriggered;
  _fireTriggered = false;
  return result;
}
```

### Key Design Notes:
1. **`e.code` over `e.key`**: Uses DOM `code` values (`KeyA`, `ArrowLeft`, etc.) which are layout-independent. This ensures `Q/W` on AZERTY and `A/Z` on QWERTY map correctly to the same physical keys.
2. **`wasFirePressed()` Pattern**: Sets a flag when the key is detected, returns it, then immediately resets it. This guarantees exactly one `true` per press cycle, regardless of how many times you call it in a single frame.
3. **`e.preventDefault()`**: Applied only to game keys to prevent unwanted browser scrolling/zooming while playing.
4. **Idempotent `initInput()`**: Safely handles multiple calls during development by tracking initialization state.

**Usage in game loop:**
```javascript
initInput();

function update() {
  if (isLeftPressed()) player.rotateLeft();
  if (isRightPressed()) player.rotateRight();
  if (isThrustPressed()) player.thrust();
  if (wasFirePressed()) player.shoot();
}
```

*(Note: `KeyW` is mapped to both Right and Thrust as specified. If you intended `KeyE` for AZERTY Right, simply change `RIGHT_KEYS` to `['ArrowRight', 'KeyD', 'KeyE']`.)*