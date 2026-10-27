import { describe, expect, it } from 'vitest';
import { CACTUS, DINO, GAME, HITBOXES, WORLD } from '../src/config';
import { Dino, computeJumpAirTime } from '../src/game/dino';
import { CACTUS_KINDS, createObstaclePool, groundTop, groupWidth, obstacleHitsBoxes, updateObstacles, type Obstacle } from '../src/game/obstacles';
import { SPRITES } from '../src/render/sprite-data';
import { Spawner, minGap } from '../src/game/spawner';

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const HOLD_TICKS = 14;

function makeObstacle(kindIndex: number, count: number, x: number): Obstacle {
  const kind = CACTUS_KINDS[kindIndex];
  if (!kind) {
    throw new Error('Unknown cactus kind');
  }
  return { x, prevX: x, y: groundTop(kind.height), kind, count, width: groupWidth(kind, count) };
}

function runPair(speed: number, first: Obstacle, second: Obstacle, takeoff1: number, takeoff2: number): boolean {
  const dt = GAME.fixedStep;
  const dino = new Dino();
  const top = groundTop(SPRITES.dinoRun1.height);
  let tick = 0;
  let releaseAt = -1;
  let landedAt = -1;
  let wasAirborne = false;
  let secondJumped = false;

  while (second.x + second.width >= DINO.x - 1 && tick < 2000) {
    if (tick === takeoff1) {
      dino.pressJump();
      releaseAt = tick + HOLD_TICKS;
    }
    if (landedAt >= 0 && !secondJumped && tick === landedAt + takeoff2) {
      dino.pressJump();
      releaseAt = tick + HOLD_TICKS;
      secondJumped = true;
    }
    if (tick === releaseAt) {
      dino.releaseJump();
    }
    dino.update(dt, speed);
    first.x -= speed * dt;
    second.x -= speed * dt;
    if (!dino.grounded) {
      wasAirborne = true;
    } else if (wasAirborne && landedAt < 0) {
      landedAt = tick;
    }
    if (obstacleHitsBoxes(first, DINO.x, top - dino.y, HITBOXES.dinoStand) || obstacleHitsBoxes(second, DINO.x, top - dino.y, HITBOXES.dinoStand)) {
      return false;
    }
    tick += 1;
  }
  return true;
}

function passable(speed: number, a: Obstacle, b: Obstacle): boolean {
  const lead = 220;
  const ticksToFirst = Math.ceil(lead / (speed * GAME.fixedStep));
  for (let takeoff1 = 0; takeoff1 <= ticksToFirst; takeoff1 += 1) {
    for (let takeoff2 = 0; takeoff2 <= 60; takeoff2 += 2) {
      const first = { ...a, x: DINO.x + lead, prevX: DINO.x + lead };
      const gapLeftToLeft = minGap(speed, a.width);
      const second = { ...b, x: DINO.x + lead + gapLeftToLeft, prevX: DINO.x + lead + gapLeftToLeft };
      if (runPair(speed, first, second, takeoff1, takeoff2)) {
        return true;
      }
    }
  }
  return false;
}

describe('Spawner', () => {
  it('leaves every pair of groups passable by a full jump at the minimum gap', () => {
    for (const speed of [GAME.startSpeed, GAME.maxSpeed]) {
      for (let kindA = 0; kindA < CACTUS_KINDS.length; kindA += 1) {
        for (let countA = 1; countA <= CACTUS.maxGroup; countA += 1) {
          for (let kindB = 0; kindB < CACTUS_KINDS.length; kindB += 1) {
            for (let countB = 1; countB <= CACTUS.maxGroup; countB += 1) {
              const a = makeObstacle(kindA, countA, 0);
              const b = makeObstacle(kindB, countB, 0);
              expect(passable(speed, a, b), `speed ${speed} A ${kindA}x${countA} B ${kindB}x${countB}`).toBe(true);
            }
          }
        }
      }
    }
  });

  it('leaves a gap every full jump can clear across 10000 spawns', () => {
    const total = 10000;
    const airTime = computeJumpAirTime();
    const pool = createObstaclePool();
    const spawner = new Spawner(pool, seededRandom(42));
    const dt = GAME.fixedStep;

    let scrolled = 0;
    let previousRight: number | null = null;
    let worstMargin = Infinity;
    let cacti = 0;

    while (spawner.spawnCount < total) {
      const speed = GAME.startSpeed + (GAME.maxSpeed - GAME.startSpeed) * (spawner.spawnCount / total);
      updateObstacles(pool, speed, dt);
      scrolled += speed * dt;
      const before = spawner.spawnCount;
      spawner.update(dt, speed);

      const spawned = spawner.lastSpawned;
      if (spawner.spawnCount > before && spawned) {
        const left = scrolled + spawned.x;
        if (previousRight !== null) {
          worstMargin = Math.min(worstMargin, left - previousRight - speed * airTime);
        }
        previousRight = left + spawned.width;
        cacti += spawned.count;
        expect(spawned.count).toBeGreaterThanOrEqual(1);
        expect(spawned.count).toBeLessThanOrEqual(CACTUS.maxGroup);
        expect(spawned.x).toBe(WORLD.width);
      }
    }

    expect(spawner.spawnCount).toBe(total);
    expect(worstMargin).toBeGreaterThanOrEqual(0);
    expect(cacti).toBeGreaterThan(total);
  });

  it('requires a larger gap at higher speed and for wider groups', () => {
    expect(minGap(GAME.maxSpeed, 20)).toBeGreaterThan(minGap(GAME.startSpeed, 20));
    expect(minGap(GAME.startSpeed, 60)).toBeGreaterThan(minGap(GAME.startSpeed, 20));
  });

  it('never exceeds the pool capacity', () => {
    const pool = createObstaclePool();
    const spawner = new Spawner(pool, seededRandom(7));

    for (let i = 0; i < 100000; i += 1) {
      updateObstacles(pool, GAME.maxSpeed, GAME.fixedStep);
      spawner.update(GAME.fixedStep, GAME.maxSpeed);
      expect(pool.activeCount).toBeLessThanOrEqual(pool.capacity);
    }
    expect(pool.items).toHaveLength(CACTUS.poolCapacity);
  });
});
