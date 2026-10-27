import { describe, expect, it } from 'vitest';
import { DINO, HITBOXES, type HitBox } from '../src/config';
import { anyOverlap, boxesOverlap } from '../src/game/collision';
import { CACTUS_KINDS, groundTop, obstacleHitsBoxes, type Obstacle } from '../src/game/obstacles';
import { SPRITES } from '../src/render/sprite-data';

const box: HitBox = { x: 0, y: 0, w: 10, h: 10 };

function cactusAt(x: number): Obstacle {
  const kind = CACTUS_KINDS[0];
  if (!kind) {
    throw new Error('No cactus kinds');
  }
  return { x, prevX: x, y: groundTop(kind.height), kind, count: 1, width: kind.width };
}

describe('collision', () => {
  it('does not count boxes that only touch by an edge', () => {
    expect(boxesOverlap(0, 0, box, 10, 0, box)).toBe(false);
    expect(boxesOverlap(0, 0, box, 0, 10, box)).toBe(false);
  });

  it('counts boxes that intersect', () => {
    expect(boxesOverlap(0, 0, box, 9, 0, box)).toBe(true);
    expect(boxesOverlap(0, 0, box, 5, 5, box)).toBe(true);
  });

  it('checks every box of each side', () => {
    const far: HitBox = { x: 100, y: 0, w: 5, h: 5 };

    expect(anyOverlap(0, 0, [far, box], 0, 0, [box])).toBe(true);
    expect(anyOverlap(0, 0, [far], 0, 0, [box])).toBe(false);
  });

  it('ignores a cactus whose sprite edge only touches the dragon sprite', () => {
    const top = groundTop(SPRITES.dinoRun1.height);
    const touching = cactusAt(DINO.x + SPRITES.dinoRun1.width);
    const overlappingSprites = cactusAt(DINO.x + SPRITES.dinoRun1.width - 2);

    expect(obstacleHitsBoxes(touching, DINO.x, top, HITBOXES.dinoStand)).toBe(false);
    expect(obstacleHitsBoxes(overlappingSprites, DINO.x, top, HITBOXES.dinoStand)).toBe(false);
  });

  it('detects a cactus overlapping the dragon hitboxes', () => {
    const top = groundTop(SPRITES.dinoRun1.height);

    expect(obstacleHitsBoxes(cactusAt(DINO.x + 20), DINO.x, top, HITBOXES.dinoStand)).toBe(true);
  });

  it('lets a jumping dragon pass over a cactus', () => {
    const top = groundTop(SPRITES.dinoRun1.height) - 60;

    expect(obstacleHitsBoxes(cactusAt(DINO.x + 10), DINO.x, top, HITBOXES.dinoStand)).toBe(false);
  });
});
