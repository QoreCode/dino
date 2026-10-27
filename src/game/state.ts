import { DINO, GAME, HITBOXES, HUD, TOUCH, WORLD } from '../config';
import { InputType, type Input } from '../core/input';
import { SPRITES } from '../render/sprite-data';
import { Clouds } from './clouds';
import { Decor } from './decor';
import { Dino } from './dino';
import { createObstaclePool, groundTop, obstacleHitsBoxes, updateObstacles } from './obstacles';
import { Spawner, type Random } from './spawner';

export type GameState = 'start' | 'playing' | 'paused' | 'gameover';

export class Game {
  state: GameState = 'start';
  speed: number = GAME.startSpeed;
  groundDistance = 0;
  prevGroundDistance = 0;
  gameOverTime = 0;
  resumeTimer = 0;
  restartCenterY: number = HUD.restartY;
  readonly dino = new Dino();
  readonly obstacles = createObstaclePool();
  readonly spawner: Spawner;
  readonly clouds: Clouds;
  readonly decor: Decor;
  private cssPerWorld = 1;

  constructor(
    private readonly input: Input,
    random: Random,
  ) {
    this.spawner = new Spawner(this.obstacles, random);
    this.clouds = new Clouds(random);
    this.decor = new Decor(random);
  }

  setCssPerWorld(value: number): void {
    this.cssPerWorld = value > 0 ? value : 1;
  }

  setRestartCenterY(value: number): void {
    this.restartCenterY = value;
  }

  update(dt: number): void {
    this.input.drain(this.handleInput);

    switch (this.state) {
      case 'start':
        this.clouds.update(dt, this.clouds.idleSpeed);
        break;
      case 'playing':
        this.updatePlaying(dt);
        break;
      case 'gameover':
        this.gameOverTime += dt;
        break;
      case 'paused':
        break;
    }
  }

  pause(): void {
    if (this.state === 'playing') {
      this.state = 'paused';
    }
  }

  releaseHeld(): void {
    this.dino.releaseJump();
    this.dino.releaseDuck();
  }

  get restartAvailable(): boolean {
    return this.gameOverTime >= GAME.restartLockTime;
  }

  get interpolating(): boolean {
    return (this.state === 'start' || this.state === 'playing') && this.resumeTimer <= 0;
  }

  private updatePlaying(dt: number): void {
    if (this.resumeTimer > 0) {
      this.resumeTimer -= dt;
      return;
    }
    this.speed = Math.min(this.speed + GAME.acceleration * dt, GAME.maxSpeed);
    this.prevGroundDistance = this.groundDistance;
    this.groundDistance += this.speed * dt;
    this.dino.update(dt, this.speed);
    updateObstacles(this.obstacles, this.speed, dt);
    this.spawner.update(dt, this.speed);
    this.clouds.update(dt, this.speed);
    this.decor.update(dt, this.speed);
    if (this.collides()) {
      this.dino.die();
      this.state = 'gameover';
      this.gameOverTime = 0;
    }
  }

  private collides(): boolean {
    const ducking = this.dino.ducking;
    const sprite = ducking ? SPRITES.dinoDuck1 : SPRITES.dinoRun1;
    const boxes = ducking ? HITBOXES.dinoDuck : HITBOXES.dinoStand;
    const top = groundTop(sprite.height) - this.dino.y;
    const left = DINO.x;
    const right = left + sprite.width;
    for (let i = 0; i < this.obstacles.activeCount; i += 1) {
      const obstacle = this.obstacles.items[i];
      if (!obstacle || obstacle.x > right || obstacle.x + obstacle.width < left) {
        continue;
      }
      if (obstacleHitsBoxes(obstacle, left, top, boxes)) {
        return true;
      }
    }
    return false;
  }

  private startRun(withJump: boolean): void {
    this.dino.reset();
    this.obstacles.clear();
    this.spawner.reset();
    this.speed = GAME.startSpeed;
    this.groundDistance = 0;
    this.prevGroundDistance = 0;
    this.gameOverTime = 0;
    this.resumeTimer = 0;
    this.state = 'playing';
    if (withJump) {
      this.dino.pressJump();
    }
  }

  private resume(): void {
    this.resumeTimer = GAME.resumeDelay;
    this.state = 'playing';
  }

  private readonly handleInput = (type: InputType, x: number, y: number): void => {
    switch (type) {
      case InputType.JumpDown:
        this.onJumpDown();
        break;
      case InputType.JumpUp:
        this.dino.releaseJump();
        break;
      case InputType.DuckDown:
        this.onDuck(false);
        break;
      case InputType.SwipeDown:
        this.onDuck(true);
        break;
      case InputType.DuckUp:
        this.dino.releaseDuck();
        break;
      case InputType.Confirm:
        this.onConfirm();
        break;
      case InputType.Pointer:
        this.onPointer(x, y);
        break;
    }
  };

  private onDuck(allowCancel: boolean): void {
    if (this.resumeTimer > 0) {
      this.dino.duckHeld = true;
      return;
    }
    this.dino.pressDuck(allowCancel);
  }

  private onJumpDown(): void {
    switch (this.state) {
      case 'start':
        this.startRun(true);
        break;
      case 'playing':
        if (this.resumeTimer <= 0) {
          this.dino.pressJump();
        }
        break;
      case 'paused':
        this.resume();
        break;
      case 'gameover':
        if (this.restartAvailable) {
          this.startRun(true);
        }
        break;
    }
  }

  private onConfirm(): void {
    switch (this.state) {
      case 'start':
        this.startRun(false);
        break;
      case 'paused':
        this.resume();
        break;
      case 'gameover':
        if (this.restartAvailable) {
          this.startRun(false);
        }
        break;
      case 'playing':
        break;
    }
  }

  private onPointer(x: number, y: number): void {
    switch (this.state) {
      case 'start':
        this.startRun(false);
        break;
      case 'paused':
        this.resume();
        break;
      case 'gameover': {
        const half = Math.max(SPRITES.restart.width / 2, TOUCH.minHitSize / 2 / this.cssPerWorld);
        const halfY = Math.max(SPRITES.restart.height / 2, TOUCH.minHitSize / 2 / this.cssPerWorld);
        if (this.restartAvailable && Math.abs(x - WORLD.width / 2) <= half && Math.abs(y - this.restartCenterY) <= halfY) {
          this.startRun(false);
        }
        break;
      }
      case 'playing':
        break;
    }
  }
}
