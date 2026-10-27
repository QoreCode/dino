import { WORLD, type LayerConfig } from '../config';
import { Pool } from '../core/pool';
import { SPRITES, type SpriteName } from '../render/sprite-data';
import type { Random } from './spawner';

export interface LayerItem {
  x: number;
  prevX: number;
  y: number;
  sprite: SpriteName;
  width: number;
}

export class ScrollLayer {
  readonly pool: Pool<LayerItem>;
  private remaining = 0;

  constructor(
    private readonly config: LayerConfig,
    private readonly random: Random,
  ) {
    this.pool = new Pool<LayerItem>(config.capacity, () => ({ x: 0, prevX: 0, y: 0, sprite: 'cloudSmall', width: 0 }));
  }

  seed(): void {
    this.pool.clear();
    let cursor = this.random() * this.config.spacingMax;
    while (cursor < WORLD.width) {
      const item = this.place(cursor);
      if (!item) {
        break;
      }
      cursor += item.width + this.spacing();
    }
    this.remaining = cursor - WORLD.width;
  }

  update(dt: number, worldSpeed: number): void {
    const distance = worldSpeed * this.config.speedFactor * dt;
    for (let i = this.pool.activeCount - 1; i >= 0; i -= 1) {
      const item = this.pool.items[i];
      if (!item) {
        continue;
      }
      item.prevX = item.x;
      item.x -= distance;
      if (item.x + item.width < 0) {
        this.pool.releaseAt(i);
      }
    }
    this.remaining -= distance;
    if (this.remaining <= 0) {
      const item = this.place(WORLD.width);
      if (item) {
        this.remaining = item.width + this.spacing();
      }
    }
  }

  private place(x: number): LayerItem | undefined {
    const name = this.config.sprites[Math.floor(this.random() * this.config.sprites.length)];
    if (!name) {
      return undefined;
    }
    const item = this.pool.acquire();
    if (!item) {
      return undefined;
    }
    const matrix = SPRITES[name];
    item.sprite = name;
    item.width = matrix.width;
    item.x = x;
    item.prevX = x;
    if (this.config.anchor === 'bottom') {
      item.y = this.config.yMin - matrix.height;
    } else {
      item.y = Math.floor(this.config.yMin + this.random() * (this.config.yMax - this.config.yMin + 1));
    }
    return item;
  }

  private spacing(): number {
    return this.config.spacingMin + this.random() * (this.config.spacingMax - this.config.spacingMin);
  }
}
