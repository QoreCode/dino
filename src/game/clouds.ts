import { CLOUDS } from '../config';
import { ScrollLayer } from './scroll-layer';
import type { Random } from './spawner';

export class Clouds {
  readonly far: ScrollLayer;
  readonly near: ScrollLayer;

  constructor(random: Random) {
    this.far = new ScrollLayer(CLOUDS.far, random);
    this.near = new ScrollLayer(CLOUDS.near, random);
    this.far.seed();
    this.near.seed();
  }

  update(dt: number, worldSpeed: number): void {
    this.far.update(dt, worldSpeed);
    this.near.update(dt, worldSpeed);
  }

  get idleSpeed(): number {
    return CLOUDS.idleSpeed;
  }
}
