import { COLORS, GROUND, PALETTE, WORLD } from '../config';
import { SPRITES, type SpriteName } from './sprite-data';

export interface Frame {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface SpriteSheet {
  readonly canvas: HTMLCanvasElement;
  readonly frames: Readonly<Record<SpriteName, Frame>>;
  readonly ground: Frame;
}

const SHEET_WIDTH = 256;

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildSpriteSheet(): SpriteSheet {
  const names = Object.keys(SPRITES) as SpriteName[];
  const groundHeight = WORLD.height - WORLD.groundY;
  const placed: Partial<Record<SpriteName, Frame>> = {};

  let cursorX = 0;
  let cursorY = 0;
  let rowHeight = 0;
  for (const name of names) {
    const matrix = SPRITES[name];
    if (cursorX + matrix.width > SHEET_WIDTH) {
      cursorX = 0;
      cursorY += rowHeight + 1;
      rowHeight = 0;
    }
    placed[name] = { x: cursorX, y: cursorY, w: matrix.width, h: matrix.height };
    cursorX += matrix.width + 1;
    rowHeight = Math.max(rowHeight, matrix.height);
  }
  cursorY += rowHeight + 1;

  const ground: Frame = { x: 0, y: cursorY, w: GROUND.tileWidth, h: groundHeight };
  const sheetHeight = cursorY + groundHeight;

  const canvas = document.createElement('canvas');
  canvas.width = SHEET_WIDTH;
  canvas.height = sheetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Sprite sheet context is not available');
  }

  for (const name of names) {
    const frame = placed[name];
    if (!frame) {
      continue;
    }
    const matrix = SPRITES[name];
    for (let row = 0; row < matrix.height; row += 1) {
      const line = matrix.rows[row] ?? '';
      for (let col = 0; col < matrix.width; col += 1) {
        const key = line.charAt(col);
        if (key === '.') {
          continue;
        }
        const color = PALETTE[key];
        if (color === undefined) {
          throw new Error(`Unknown palette key "${key}" in sprite ${name}`);
        }
        ctx.fillStyle = color;
        ctx.fillRect(frame.x + col, frame.y + row, 1, 1);
      }
    }
  }

  paintGround(ctx, ground);

  return { canvas, frames: placed as Record<SpriteName, Frame>, ground };
}

function paintGround(ctx: CanvasRenderingContext2D, frame: Frame): void {
  const random = mulberry32(GROUND.seed);
  ctx.fillStyle = COLORS.groundFill;
  ctx.fillRect(frame.x, frame.y, frame.w, frame.h);
  ctx.fillStyle = COLORS.groundLine;
  ctx.fillRect(frame.x, frame.y, frame.w, 1);
  for (let row = 2; row < frame.h; row += 1) {
    for (let col = 0; col < frame.w; col += 1) {
      const roll = random();
      if (roll < GROUND.speckDensity) {
        ctx.fillStyle = COLORS.groundSpeck;
        ctx.fillRect(frame.x + col, frame.y + row, 1 + (random() < 0.5 ? 1 : 0), 1);
      } else if (roll < GROUND.speckDensity * 1.4) {
        ctx.fillStyle = COLORS.groundSpeckDark;
        ctx.fillRect(frame.x + col, frame.y + row, 1, 1);
      }
    }
  }
}
