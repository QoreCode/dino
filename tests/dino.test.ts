import { describe, expect, it } from 'vitest';
import { GAME } from '../src/config';
import { FixedStepper } from '../src/core/loop';
import { Dino, computeMaxJumpHeight } from '../src/game/dino';

const DT = GAME.fixedStep;

interface Flight {
  apex: number;
  steps: number;
}

function fly(dino: Dino, releaseAfter: number, duckAtApex: boolean): Flight {
  dino.pressJump();
  let apex = 0;
  let steps = 0;
  let released = false;
  while (steps < 600) {
    dino.update(DT, GAME.startSpeed);
    steps += 1;
    if (!released && steps >= releaseAfter) {
      dino.releaseJump();
      released = true;
    }
    if (duckAtApex && dino.vy < 0) {
      dino.pressDuck(false);
    }
    apex = Math.max(apex, dino.y);
    if (dino.grounded) {
      break;
    }
  }
  return { apex, steps };
}

describe('Dino', () => {
  it('jumps lower on a short press than on a long press', () => {
    const short = fly(new Dino(), 1, false);
    const long = fly(new Dino(), Infinity, false);

    expect(short.apex).toBeGreaterThan(0);
    expect(short.apex).toBeLessThan(long.apex);
  });

  it('reaches the computed apex when the key is held forever', () => {
    const long = fly(new Dino(), Infinity, false);

    const expected = computeMaxJumpHeight();

    expect(Math.abs(long.apex - expected)).toBeLessThan(expected * 0.05);
  });

  it('jumps as high with the duck key already held as without it', () => {
    const plain = fly(new Dino(), Infinity, false);
    const dino = new Dino();
    dino.pressDuck(false);
    const held = fly(dino, Infinity, false);

    expect(held.apex).toBeCloseTo(plain.apex, 6);
  });

  it('cancels a jump when a touch swipe arrives right after takeoff', () => {
    const dino = new Dino();
    dino.pressJump();
    dino.update(DT, GAME.startSpeed);
    dino.pressDuck(true);

    expect(dino.grounded).toBe(true);
    expect(dino.y).toBe(0);

    dino.update(DT, GAME.startSpeed);
    expect(dino.pose).toBe('duck');
  });

  it('does not cancel a jump on a keyboard duck press 50 to 95 ms after takeoff', () => {
    for (const steps of [3, 4, 5, 6]) {
      const dino = new Dino();
      dino.pressJump();
      for (let i = 0; i < steps; i += 1) {
        dino.update(DT, GAME.startSpeed);
      }
      dino.pressDuck(false);

      expect(dino.grounded).toBe(false);
      expect(dino.fastFalling).toBe(true);
      expect(dino.y).toBeGreaterThan(0);
    }
  });

  it('does not cancel a swipe once the dragon is above the cancel height', () => {
    const dino = new Dino();
    dino.pressJump();
    for (let i = 0; i < 5; i += 1) {
      dino.update(DT, GAME.startSpeed);
    }
    dino.pressDuck(true);

    expect(dino.grounded).toBe(false);
    expect(dino.fastFalling).toBe(true);
  });

  it('ignores the cancel on a dead dragon', () => {
    const dino = new Dino();
    dino.pressJump();
    dino.update(DT, GAME.startSpeed);
    dino.die();
    dino.pressDuck(true);

    expect(dino.grounded).toBe(false);
  });

  it('does not rebound into a buffered jump after a swipe in the air', () => {
    const dino = new Dino();
    dino.pressJump();
    for (let i = 0; i < 28; i += 1) {
      dino.update(DT, GAME.startSpeed);
    }
    dino.pressJump();
    dino.pressDuck(false);
    let jumpedAgain = false;
    let landed = false;
    for (let i = 0; i < 120; i += 1) {
      dino.update(DT, GAME.startSpeed);
      if (dino.grounded) {
        landed = true;
      } else if (landed) {
        jumpedAgain = true;
      }
    }

    expect(landed).toBe(true);
    expect(jumpedAgain).toBe(false);
  });

  it('lands earlier with fast fall', () => {
    const normal = fly(new Dino(), Infinity, false);
    const fast = fly(new Dino(), Infinity, true);

    expect(fast.steps).toBeLessThan(normal.steps);
  });

  it('ducks only on the ground', () => {
    const dino = new Dino();
    dino.duckHeld = true;
    dino.update(DT, GAME.startSpeed);

    expect(dino.pose).toBe('duck');

    dino.duckHeld = false;
    dino.pressJump();
    dino.update(DT, GAME.startSpeed);
    dino.duckHeld = true;
    dino.update(DT, GAME.startSpeed);

    expect(dino.pose).toBe('air');
  });

  it('gives the same result regardless of how real time is split into frames', () => {
    const total = 0.405;
    const results = [3, 5, 7, 30, 60, 144].map((frames) => {
      const dino = new Dino();
      const stepper = new FixedStepper(GAME.fixedStep, GAME.maxFrameTime);
      dino.pressJump();
      for (let i = 0; i < frames; i += 1) {
        stepper.advance(total / frames, (dt) => dino.update(dt, GAME.startSpeed));
      }
      return { y: dino.y, vy: dino.vy, grounded: dino.grounded, runDistance: dino.runDistance };
    });

    const [first, ...rest] = results;
    expect(first?.grounded).toBe(false);
    for (const result of rest) {
      expect(result).toEqual(first);
    }
  });

  it('clamps long frames so a hidden tab does not fast-forward the logic', () => {
    const stepper = new FixedStepper(GAME.fixedStep, GAME.maxFrameTime);
    let steps = 0;

    stepper.advance(30, () => {
      steps += 1;
    });

    expect(steps).toBeLessThanOrEqual(Math.ceil(GAME.maxFrameTime / GAME.fixedStep));
  });
});
