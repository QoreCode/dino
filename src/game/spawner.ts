import { CACTUS, WORLD } from '../config';
import type { Pool } from '../core/pool';
import { computeJumpAirTime } from './dino';
import { CACTUS_KINDS, groundTop, groupWidth, type Obstacle } from './obstacles';

export type Random = () => number;

const AIR_TIME = computeJumpAirTime();

export function minGap(speed: number, width: number): number {
  return speed * AIR_TIME * CACTUS.gapSafetyFactor + width;
}

export class Spawner {
  spawnCount = 0;
  lastSpawned: Obstacle | null = null;
  private remaining: number = CACTUS.firstSpawnDistance;

  constructor(
    private readonly pool: Pool<Obstacle>,
    private readonly random: Random,
  ) {}

  reset(): void {
    this.remaining = CACTUS.firstSpawnDistance;
    this.spawnCount = 0;
    this.lastSpawned = null;
  }

  update(dt: number, speed: number): void {
    this.remaining -= speed * dt;
    if (this.remaining > 0) {
      return;
    }
    const kind = CACTUS_KINDS[Math.floor(this.random() * CACTUS_KINDS.length)];
    if (!kind) {
      return;
    }
    const obstacle = this.pool.acquire();
    if (!obstacle) {
      return;
    }
    const count = 1 + Math.floor(this.random() * CACTUS.maxGroup);
    const width = groupWidth(kind, count);
    obstacle.kind = kind;
    obstacle.count = count;
    obstacle.width = width;
    obstacle.x = WORLD.width;
    obstacle.prevX = WORLD.width;
    obstacle.y = groundTop(kind.height);
    this.spawnCount += 1;
    this.lastSpawned = obstacle;
    this.remaining = minGap(speed, width) + this.random() * CACTUS.gapRandomness;
  }
}
