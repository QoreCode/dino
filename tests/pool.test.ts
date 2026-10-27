import { describe, expect, it } from 'vitest';
import { Pool } from '../src/core/pool';

interface Item {
  id: number;
}

describe('Pool', () => {
  it('does not grow after 10000 acquire and release cycles', () => {
    let created = 0;
    const pool = new Pool<Item>(8, () => ({ id: created++ }));
    const held: Item[] = [];

    for (let cycle = 0; cycle < 10000; cycle += 1) {
      const take = 1 + (cycle % 8);
      for (let i = 0; i < take; i += 1) {
        const item = pool.acquire();
        expect(item).toBeDefined();
        if (item) {
          held.push(item);
        }
      }
      while (held.length > 0) {
        const item = held.pop();
        expect(item !== undefined && pool.release(item)).toBe(true);
      }
      expect(pool.activeCount).toBe(0);
    }

    expect(created).toBe(8);
    expect(pool.capacity).toBe(8);
    expect(pool.items).toHaveLength(8);
  });

  it('returns undefined when exhausted', () => {
    const pool = new Pool<Item>(2, () => ({ id: 0 }));

    expect(pool.acquire()).toBeDefined();
    expect(pool.acquire()).toBeDefined();
    expect(pool.acquire()).toBeUndefined();
    expect(pool.items).toHaveLength(2);
  });

  it('keeps active items packed after releaseAt', () => {
    const pool = new Pool<Item>(3, () => ({ id: 0 }));
    const a = pool.acquire();
    const b = pool.acquire();
    const c = pool.acquire();
    if (!a || !b || !c) {
      throw new Error('Pool did not hand out items');
    }
    a.id = 1;
    b.id = 2;
    c.id = 3;

    pool.releaseAt(0);

    expect(pool.activeCount).toBe(2);
    expect(
      pool.items
        .slice(0, 2)
        .map((item) => item.id)
        .sort(),
    ).toEqual([2, 3]);
  });
});
