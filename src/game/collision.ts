import type { HitBox } from '../config';

export type { HitBox };

export function boxesOverlap(ax: number, ay: number, a: HitBox, bx: number, by: number, b: HitBox): boolean {
  return ax + a.x < bx + b.x + b.w && ax + a.x + a.w > bx + b.x && ay + a.y < by + b.y + b.h && ay + a.y + a.h > by + b.y;
}

export function anyOverlap(ax: number, ay: number, as: readonly HitBox[], bx: number, by: number, bs: readonly HitBox[]): boolean {
  for (let i = 0; i < as.length; i += 1) {
    const a = as[i];
    if (!a) {
      continue;
    }
    for (let j = 0; j < bs.length; j += 1) {
      const b = bs[j];
      if (b && boxesOverlap(ax, ay, a, bx, by, b)) {
        return true;
      }
    }
  }
  return false;
}
