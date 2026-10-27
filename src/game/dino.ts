import { DINO, TOUCH } from '../config';
import type { SpriteName } from '../render/sprite-data';

export type DinoPose = 'run' | 'duck' | 'air' | 'dead';

export function computeJumpAirTime(): number {
  const holdTime = DINO.maxJumpHoldTime;
  const holdGravity = DINO.gravity * DINO.holdGravityMultiplier;
  const velocity = DINO.jumpVelocity - holdGravity * holdTime;
  const height = DINO.jumpVelocity * holdTime - 0.5 * holdGravity * holdTime * holdTime;
  const fall = (velocity + Math.sqrt(velocity * velocity + 2 * DINO.gravity * height)) / DINO.gravity;
  return holdTime + fall;
}

export function computeMaxJumpHeight(): number {
  const holdTime = DINO.maxJumpHoldTime;
  const holdGravity = DINO.gravity * DINO.holdGravityMultiplier;
  const velocity = DINO.jumpVelocity - holdGravity * holdTime;
  const height = DINO.jumpVelocity * holdTime - 0.5 * holdGravity * holdTime * holdTime;
  return height + (velocity * velocity) / (2 * DINO.gravity);
}

export class Dino {
  y = 0;
  prevY = 0;
  vy = 0;
  grounded = true;
  ducking = false;
  dead = false;
  jumpHeld = false;
  duckHeld = false;
  fastFalling = false;
  runDistance = 0;
  frame = 0;
  private airTime = 0;
  private holding = false;
  private holdTime = 0;
  private jumpBuffer = 0;

  reset(): void {
    this.y = 0;
    this.prevY = 0;
    this.vy = 0;
    this.grounded = true;
    this.ducking = false;
    this.dead = false;
    this.fastFalling = false;
    this.runDistance = 0;
    this.frame = 0;
    this.airTime = 0;
    this.holding = false;
    this.holdTime = 0;
    this.jumpBuffer = 0;
  }

  pressJump(): void {
    this.jumpHeld = true;
    this.jumpBuffer = DINO.jumpBufferTime;
  }

  releaseJump(): void {
    this.jumpHeld = false;
    this.holding = false;
  }

  pressDuck(allowCancel: boolean): void {
    this.duckHeld = true;
    if (this.dead) {
      return;
    }
    this.jumpBuffer = 0;
    if (this.grounded) {
      return;
    }
    if (allowCancel && this.airTime < TOUCH.duckCancelJumpTime && this.y <= TOUCH.duckCancelMaxHeight) {
      this.y = 0;
      this.prevY = 0;
      this.vy = 0;
      this.grounded = true;
      this.holding = false;
      return;
    }
    this.fastFalling = true;
  }

  releaseDuck(): void {
    this.duckHeld = false;
  }

  die(): void {
    this.dead = true;
  }

  update(dt: number, speed: number): void {
    this.prevY = this.y;
    if (this.dead) {
      return;
    }
    if (this.jumpBuffer > 0) {
      this.jumpBuffer -= dt;
      if (this.grounded) {
        this.vy = DINO.jumpVelocity;
        this.grounded = false;
        this.jumpBuffer = 0;
        this.holding = this.jumpHeld;
        this.holdTime = 0;
        this.airTime = 0;
        this.fastFalling = false;
      }
    }

    if (!this.grounded) {
      this.airTime += dt;
      let gravity: number = DINO.gravity;
      if (this.fastFalling) {
        gravity *= DINO.fastFallMultiplier;
      } else if (this.holding && this.holdTime < DINO.maxJumpHoldTime) {
        gravity *= DINO.holdGravityMultiplier;
        this.holdTime += dt;
      }
      this.vy -= gravity * dt;
      this.y += this.vy * dt;
      if (this.y <= 0) {
        this.y = 0;
        this.vy = 0;
        this.grounded = true;
        this.fastFalling = false;
      }
    }

    this.ducking = this.grounded && this.duckHeld;
    if (this.grounded) {
      this.runDistance += speed * dt;
      this.frame = Math.floor(this.runDistance / DINO.runStepDistance) % 2;
    }
  }

  get pose(): DinoPose {
    if (this.dead) {
      return 'dead';
    }
    if (!this.grounded) {
      return 'air';
    }
    return this.ducking ? 'duck' : 'run';
  }

  get sprite(): SpriteName {
    switch (this.pose) {
      case 'dead':
        return this.ducking ? 'dinoDuckDead' : 'dinoDead';
      case 'air':
        return 'dinoJump';
      case 'duck':
        return this.frame === 0 ? 'dinoDuck1' : 'dinoDuck2';
      case 'run':
        return this.frame === 0 ? 'dinoRun1' : 'dinoRun2';
    }
  }
}
