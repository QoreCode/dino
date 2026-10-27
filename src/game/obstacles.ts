import { CACTUS, HITBOXES, WORLD, type HitBox } from '../config';
import { Pool } from '../core/pool';
import { SPRITES, type SpriteName } from '../render/sprite-data';
import { anyOverlap } from './collision';

export interface CactusKind {
  readonly sprite: SpriteName;
  readonly width: number;
  readonly height: number;
  readonly boxes: readonly HitBox[];
}

export const CACTUS_KINDS: readonly CactusKind[] = [
  { sprite: 'cactusSmall', width: SPRITES.cactusSmall.width, height: SPRITES.cactusSmall.height, boxes: HITBOXES.cactusSmall },
  { sprite: 'cactusLarge', width: SPRITES.cactusLarge.width, height: SPRITES.cactusLarge.height, boxes: HITBOXES.cactusLarge },
];

export interface Obstacle {
  x: number;
  prevX: number;
  y: number;
  kind: CactusKind;
  count: number;
  width: number;
}

const FALLBACK_KIND: CactusKind = CACTUS_KINDS[0] as CactusKind;

export function createObstaclePool(): Pool<Obstacle> {
  return new Pool<Obstacle>(CACTUS.poolCapacity, () => ({ x: 0, prevX: 0, y: 0, kind: FALLBACK_KIND, count: 1, width: 0 }));
}

export function groupWidth(kind: CactusKind, count: number): number {
  return count * kind.width + (count - 1) * CACTUS.spacing;
}

export function groundTop(height: number): number {
  return WORLD.groundY + WORLD.objectSink - height;
}

export function updateObstacles(pool: Pool<Obstacle>, speed: number, dt: number): void {
  const distance = speed * dt;
  for (let i = pool.activeCount - 1; i >= 0; i -= 1) {
    const obstacle = pool.items[i];
    if (!obstacle) {
      continue;
    }
    obstacle.prevX = obstacle.x;
    obstacle.x -= distance;
    if (obstacle.x + obstacle.width < 0) {
      pool.releaseAt(i);
    }
  }
}

export function obstacleHitsBoxes(obstacle: Obstacle, ax: number, ay: number, boxes: readonly HitBox[]): boolean {
  const stride = obstacle.kind.width + CACTUS.spacing;
  for (let k = 0; k < obstacle.count; k += 1) {
    if (anyOverlap(ax, ay, boxes, obstacle.x + k * stride, obstacle.y, obstacle.kind.boxes)) {
      return true;
    }
  }
  return false;
}
