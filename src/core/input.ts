import { TOUCH, WORLD } from '../config';

export const InputType = {
  JumpDown: 0,
  JumpUp: 1,
  DuckDown: 2,
  DuckUp: 3,
  Confirm: 4,
  Pointer: 5,
  SwipeDown: 6,
} as const;

export type InputType = (typeof InputType)[keyof typeof InputType];

export type InputHandler = (type: InputType, x: number, y: number) => void;

const QUEUE_SIZE = 32;

export class Input {
  onWake: (() => void) | null = null;

  private readonly types = new Uint8Array(QUEUE_SIZE);
  private readonly xs = new Float32Array(QUEUE_SIZE);
  private readonly ys = new Float32Array(QUEUE_SIZE);
  private head = 0;
  private count = 0;
  private touchId = -1;
  private touchStartY = 0;
  private touchDucking = false;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly touchTarget: HTMLElement,
  ) {}

  attach(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.touchTarget.addEventListener('touchstart', this.onTouchStart, { passive: false });
    this.touchTarget.addEventListener('touchmove', this.onTouchMove, { passive: false });
    this.touchTarget.addEventListener('touchend', this.onTouchEnd, { passive: false });
    this.touchTarget.addEventListener('touchcancel', this.onTouchEnd, { passive: false });
    this.canvas.addEventListener('click', this.onClick);
  }

  push(type: InputType, x = 0, y = 0): void {
    if (this.count >= QUEUE_SIZE) {
      return;
    }
    const slot = (this.head + this.count) % QUEUE_SIZE;
    this.types[slot] = type;
    this.xs[slot] = x;
    this.ys[slot] = y;
    this.count += 1;
    this.onWake?.();
  }

  drain(handler: InputHandler): void {
    while (this.count > 0) {
      const slot = this.head;
      const type = this.types[slot] as InputType;
      const x = this.xs[slot] ?? 0;
      const y = this.ys[slot] ?? 0;
      this.head = (this.head + 1) % QUEUE_SIZE;
      this.count -= 1;
      handler(type, x, y);
    }
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    const type = keyDownType(event.code);
    if (type === null) {
      return;
    }
    event.preventDefault();
    if (event.repeat) {
      return;
    }
    this.push(type);
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    const type = keyUpType(event.code);
    if (type === null) {
      return;
    }
    event.preventDefault();
    this.push(type);
  };

  private readonly onTouchStart = (event: TouchEvent): void => {
    event.preventDefault();
    if (this.touchId !== -1) {
      return;
    }
    const touch = event.changedTouches.item(0);
    if (!touch) {
      return;
    }
    this.touchId = touch.identifier;
    this.touchStartY = touch.clientY;
    this.touchDucking = false;
    this.push(InputType.JumpDown);
  };

  private readonly onTouchMove = (event: TouchEvent): void => {
    event.preventDefault();
    if (this.touchId === -1 || this.touchDucking) {
      return;
    }
    for (let i = 0; i < event.changedTouches.length; i += 1) {
      const touch = event.changedTouches.item(i);
      if (touch && touch.identifier === this.touchId && touch.clientY - this.touchStartY > TOUCH.swipeThreshold) {
        this.touchDucking = true;
        this.push(InputType.SwipeDown);
        return;
      }
    }
  };

  private readonly onTouchEnd = (event: TouchEvent): void => {
    event.preventDefault();
    if (this.touchId === -1) {
      return;
    }
    for (let i = 0; i < event.changedTouches.length; i += 1) {
      const touch = event.changedTouches.item(i);
      if (touch && touch.identifier === this.touchId) {
        this.touchId = -1;
        if (this.touchDucking) {
          this.touchDucking = false;
          this.push(InputType.DuckUp);
        }
        this.push(InputType.JumpUp);
        return;
      }
    }
  };

  private readonly onClick = (event: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return;
    }
    const x = ((event.clientX - rect.left) / rect.width) * WORLD.width;
    const y = ((event.clientY - rect.top) / rect.height) * WORLD.height;
    this.push(InputType.Pointer, x, y);
  };
}

function keyDownType(code: string): InputType | null {
  switch (code) {
    case 'Space':
    case 'ArrowUp':
      return InputType.JumpDown;
    case 'ArrowDown':
      return InputType.DuckDown;
    case 'Enter':
    case 'NumpadEnter':
      return InputType.Confirm;
    default:
      return null;
  }
}

function keyUpType(code: string): InputType | null {
  switch (code) {
    case 'Space':
    case 'ArrowUp':
      return InputType.JumpUp;
    case 'ArrowDown':
      return InputType.DuckUp;
    default:
      return null;
  }
}
