/* eslint-disable import/prefer-default-export */
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
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.canvas = null;
  }

  init(canvas, callbacks = {}) {
    if (this.canvas) this.cleanup();
    this.canvas = canvas;
    this.callbacks = callbacks;

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });
    canvas.addEventListener('touchend', this.onTouchEnd);
  }

  cleanup() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    if (this.canvas) {
      this.canvas.removeEventListener('touchstart', this.onTouchStart);
      this.canvas.removeEventListener('touchmove', this.onTouchMove);
      this.canvas.removeEventListener('touchend', this.onTouchEnd);
      this.canvas = null;
    }
  }

  onKeyDown(e) {
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

  onKeyUp(e) {
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

  onTouchStart(e) {
    e.preventDefault();
    if (this.callbacks.isPlaying && !this.callbacks.isPlaying()) return;
    const touch = e.touches[0];
    this.touchX = touch.clientX;
    this.touchY = touch.clientY;
  }

  onTouchMove(e) {
    e.preventDefault();
    if (this.callbacks.isPlaying && !this.callbacks.isPlaying()) return;
    const touch = e.touches[0];
    this.touchX = touch.clientX;
    this.touchY = touch.clientY;
  }

  onTouchEnd() {
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
