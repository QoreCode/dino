export class FixedStepper {
  private accumulator = 0;

  constructor(
    readonly step: number,
    readonly maxFrameTime: number,
  ) {}

  advance(frameTime: number, update: (dt: number) => void): number {
    this.accumulator += Math.min(Math.max(frameTime, 0), this.maxFrameTime);
    while (this.accumulator >= this.step) {
      update(this.step);
      this.accumulator -= this.step;
    }
    return this.accumulator / this.step;
  }

  reset(): void {
    this.accumulator = 0;
  }
}

export class GameLoop {
  running = false;
  private rafId = 0;
  private lastTime = -1;

  constructor(
    private readonly stepper: FixedStepper,
    private readonly update: (dt: number) => void,
    private readonly render: (alpha: number) => void,
  ) {}

  start(): void {
    if (this.running) {
      return;
    }
    this.running = true;
    this.lastTime = -1;
    this.stepper.reset();
    this.rafId = requestAnimationFrame(this.frame);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  private readonly frame = (time: number): void => {
    if (!this.running) {
      return;
    }
    if (this.lastTime < 0) {
      this.lastTime = time;
    }
    const frameTime = (time - this.lastTime) / 1000;
    this.lastTime = time;
    const alpha = this.stepper.advance(frameTime, this.update);
    this.render(alpha);
    this.rafId = requestAnimationFrame(this.frame);
  };
}
