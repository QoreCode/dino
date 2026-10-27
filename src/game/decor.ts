import { DECOR } from '../config';
import { ScrollLayer } from './scroll-layer';
import type { Random } from './spawner';

export class Decor {
  readonly far: ScrollLayer;
  readonly near: ScrollLayer;

  constructor(random: Random) {
    this.far = new ScrollLayer(DECOR.far, random);
    this.near = new ScrollLayer(DECOR.near, random);
    this.far.seed();
    this.near.seed();
  }

  update(dt: number, worldSpeed: number): void {
    this.far.update(dt, worldSpeed);
    this.near.update(dt, worldSpeed);
  }
}
