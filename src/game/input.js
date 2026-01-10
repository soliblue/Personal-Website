// Input handling for keyboard and touch

export class InputSystem {
  constructor() {
    this.keys = {
      left: false,
      right: false,
      up: false,
      down: false,
    };
    this.touchX = null;
    this.touchY = null;

    // Bound handlers for cleanup
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
  }

  init(canvas, callbacks = {}) {
    this.callbacks = callbacks;

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);

    canvas.addEventListener('touchstart', (e) => this._onTouchStart(e), { passive: false });
    canvas.addEventListener('touchmove', (e) => this._onTouchMove(e), { passive: false });
    canvas.addEventListener('touchend', () => this._onTouchEnd());
  }

  cleanup() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
  }

  _onKeyDown(e) {
    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
        this.keys.left = true;
        break;
      case 'ArrowRight':
      case 'd':
        this.keys.right = true;
        break;
      case 'ArrowUp':
      case 'w':
        this.keys.up = true;
        break;
      case 'ArrowDown':
      case 's':
        this.keys.down = true;
        break;
      case 'p':
      case 'P':
      case 'Escape':
        if (this.callbacks.onPause) {
          this.callbacks.onPause();
        }
        break;
      default:
        break;
    }
  }

  _onKeyUp(e) {
    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
        this.keys.left = false;
        break;
      case 'ArrowRight':
      case 'd':
        this.keys.right = false;
        break;
      case 'ArrowUp':
      case 'w':
        this.keys.up = false;
        break;
      case 'ArrowDown':
      case 's':
        this.keys.down = false;
        break;
      default:
        break;
    }
  }

  _onTouchStart(e) {
    e.preventDefault();
    if (this.callbacks.isPlaying && !this.callbacks.isPlaying()) return;
    const touch = e.touches[0];
    this.touchX = touch.clientX;
    this.touchY = touch.clientY;
  }

  _onTouchMove(e) {
    e.preventDefault();
    if (this.callbacks.isPlaying && !this.callbacks.isPlaying()) return;
    const touch = e.touches[0];
    this.touchX = touch.clientX;
    this.touchY = touch.clientY;
  }

  _onTouchEnd() {
    this.touchX = null;
    this.touchY = null;
  }

  getTargetPosition() {
    return {
      x: this.touchX,
      y: this.touchY,
    };
  }

  reset() {
    this.keys = {
      left: false,
      right: false,
      up: false,
      down: false,
    };
    this.touchX = null;
    this.touchY = null;
  }
}
