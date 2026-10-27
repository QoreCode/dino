import { describe, expect, it } from 'vitest';
import { WORLD } from '../src/config';
import { computeViewport } from '../src/render/viewport';

describe('computeViewport', () => {
  it('uses an integer scale when it fills most of the space', () => {
    const size = computeViewport(1300, 800, 2);

    expect(size.pixelScale).toBe(4);
    expect(size.bufferWidth).toBe(WORLD.width * 4);
    expect(size.cssWidth).toBe(1200);
  });

  it('falls back to a fractional scale on narrow screens', () => {
    const size = computeViewport(343, 700, 3);

    expect(size.pixelScale).toBeCloseTo(1.715);
    expect(size.cssWidth).toBeLessThanOrEqual(343);
  });

  it('keeps the world aspect ratio', () => {
    const size = computeViewport(1920, 200, 1);

    expect(size.bufferWidth / size.bufferHeight).toBeCloseTo(WORLD.width / WORLD.height);
    expect(size.cssHeight).toBeLessThanOrEqual(200);
  });
});
