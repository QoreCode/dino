import { CACTUS, COLORS, DINO, GROUND, HUD, TEXT, WORLD } from '../config';
import { groundTop } from '../game/obstacles';
import type { ScrollLayer } from '../game/scroll-layer';
import type { Game } from '../game/state';
import { SPRITES, type SpriteName } from './sprite-data';
import type { SpriteSheet } from './sprites';
import type { ViewportSize } from './viewport';

export class Renderer {
  private readonly world: HTMLCanvasElement;
  private readonly worldCtx: CanvasRenderingContext2D;
  private readonly sky: CanvasGradient;
  private readonly coarse = window.matchMedia('(pointer: coarse)');
  private readonly portrait = window.matchMedia('(orientation: portrait)');
  private inter: HTMLCanvasElement | null = null;
  private interCtx: CanvasRenderingContext2D | null = null;
  private interScale = 1;
  private integerScale = true;
  private scale = 1;
  private dpr = 1;
  private bufferWidth: number = WORLD.width;
  private bufferHeight: number = WORLD.height;
  private titleFont = '';
  private hintFont = '';
  private smallFont = '';
  private titlePx = 0;
  private hintPx = 0;
  private smallPx = 0;
  private startHintY = 0;
  private controlsY = 0;
  private rotateY = 0;
  private pauseY = 0;
  private pauseHintY = 0;
  private centerX = 0;
  private titleY = 0;
  private iconPx = 0;
  private iconCenterY = 0;
  private restartHintY = 0;
  private restartHintFits = true;
  restartCenterY: number = HUD.restartY;

  constructor(
    private readonly ctx: CanvasRenderingContext2D,
    private readonly sheet: SpriteSheet,
  ) {
    this.world = document.createElement('canvas');
    this.world.width = WORLD.width;
    this.world.height = WORLD.height;
    const worldCtx = this.world.getContext('2d');
    if (!worldCtx) {
      throw new Error('World buffer context is not available');
    }
    worldCtx.imageSmoothingEnabled = false;
    this.worldCtx = worldCtx;
    this.sky = worldCtx.createLinearGradient(0, 0, 0, WORLD.groundY);
    this.sky.addColorStop(0, COLORS.skyTop);
    this.sky.addColorStop(1, COLORS.skyBottom);
    this.coarse.addEventListener('change', () => this.layout());
  }

  resize(size: ViewportSize): void {
    this.dpr = window.devicePixelRatio || 1;
    this.scale = size.pixelScale;
    this.bufferWidth = size.bufferWidth;
    this.bufferHeight = size.bufferHeight;
    this.integerScale = Number.isInteger(size.pixelScale);
    this.interScale = Math.ceil(size.pixelScale);

    if (!this.integerScale && this.interScale > 1) {
      const inter = this.inter ?? document.createElement('canvas');
      inter.width = WORLD.width * this.interScale;
      inter.height = WORLD.height * this.interScale;
      const interCtx = inter.getContext('2d');
      if (interCtx) {
        interCtx.imageSmoothingEnabled = false;
        this.inter = inter;
        this.interCtx = interCtx;
      } else {
        this.inter = null;
        this.interCtx = null;
      }
    } else {
      this.inter = null;
      this.interCtx = null;
    }

    this.ctx.imageSmoothingQuality = 'high';
    this.titlePx = Math.max(Math.round(HUD.titleSize * this.scale), Math.round(HUD.minTitleCssPx * this.dpr));
    this.hintPx = Math.max(Math.round(HUD.hintSize * this.scale), Math.round(HUD.minHintCssPx * this.dpr));
    this.smallPx = Math.max(Math.round(HUD.smallSize * this.scale), Math.round(HUD.minSmallCssPx * this.dpr));
    this.titleFont = `bold ${this.titlePx}px ${HUD.font}`;
    this.hintFont = `${this.hintPx}px ${HUD.font}`;
    this.smallFont = `${this.smallPx}px ${HUD.font}`;
    this.centerX = Math.round(this.bufferWidth / 2);
    this.layout();
  }

  render(game: Game, alpha: number): void {
    game.setRestartCenterY(this.restartCenterY);
    const a = game.interpolating ? alpha : 1;
    const wctx = this.worldCtx;
    wctx.fillStyle = this.sky;
    wctx.fillRect(0, 0, WORLD.width, WORLD.groundY);

    this.drawLayer(game.clouds.far, a);
    this.drawLayer(game.clouds.near, a);
    this.drawLayer(game.decor.far, a);
    this.drawGround(game.prevGroundDistance + (game.groundDistance - game.prevGroundDistance) * a);
    this.drawLayer(game.decor.near, a);
    this.drawObstacles(game, a);
    this.drawDino(game, a);

    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (this.inter && this.interCtx) {
      this.interCtx.drawImage(this.world, 0, 0, WORLD.width, WORLD.height, 0, 0, this.inter.width, this.inter.height);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(this.inter, 0, 0, this.inter.width, this.inter.height, 0, 0, this.bufferWidth, this.bufferHeight);
    } else {
      ctx.imageSmoothingEnabled = !this.integerScale;
      ctx.drawImage(this.world, 0, 0, WORLD.width, WORLD.height, 0, 0, this.bufferWidth, this.bufferHeight);
    }
    this.drawHud(game);
  }

  private layout(): void {
    const scale = this.scale;
    const baseIcon = Math.round(SPRITES.restart.width * scale);
    const wanted = this.coarse.matches ? Math.max(baseIcon, Math.round(HUD.minRestartIconCssPx * this.dpr)) : baseIcon;
    this.iconPx = Math.ceil(wanted / SPRITES.restart.width) * SPRITES.restart.width;
    this.titleY = Math.round(HUD.gameOverY * scale);
    const gap = Math.round(HUD.restartGap * scale);
    this.startHintY = Math.round(HUD.hintY * scale);
    this.controlsY = Math.max(Math.round(HUD.controlsY * scale), this.startHintY + Math.ceil(this.hintPx / 2) + gap + Math.ceil(this.smallPx / 2));
    this.rotateY = Math.max(Math.round(HUD.rotateY * scale), this.controlsY + this.smallPx + gap);
    this.pauseY = Math.round(HUD.pauseY * scale);
    this.pauseHintY = Math.max(Math.round(HUD.pauseHintY * scale), this.pauseY + Math.ceil(this.titlePx / 2) + gap + Math.ceil(this.hintPx / 2));
    const half = Math.ceil(this.iconPx / 2);
    this.iconCenterY = Math.max(Math.round(HUD.restartY * scale), this.titleY + Math.ceil(this.titlePx / 2) + gap + half);
    const hintHalf = Math.ceil(this.hintPx / 2);
    this.restartHintY = Math.min(this.iconCenterY + half + gap + hintHalf, this.bufferHeight - hintHalf);
    this.restartHintFits = this.restartHintY + hintHalf <= WORLD.groundY * scale;
    this.restartCenterY = this.iconCenterY / scale;
  }

  private drawSprite(name: SpriteName, x: number, y: number): void {
    const frame = this.sheet.frames[name];
    this.worldCtx.drawImage(this.sheet.canvas, frame.x, frame.y, frame.w, frame.h, Math.round(x), Math.round(y), frame.w, frame.h);
  }

  private drawLayer(layer: ScrollLayer, alpha: number): void {
    const pool = layer.pool;
    for (let i = 0; i < pool.activeCount; i += 1) {
      const item = pool.items[i];
      if (item) {
        this.drawSprite(item.sprite, item.prevX + (item.x - item.prevX) * alpha, item.y);
      }
    }
  }

  private drawGround(distance: number): void {
    const frame = this.sheet.ground;
    const start = -Math.round(distance % GROUND.tileWidth);
    for (let x = start; x < WORLD.width; x += GROUND.tileWidth) {
      this.worldCtx.drawImage(this.sheet.canvas, frame.x, frame.y, frame.w, frame.h, x, WORLD.groundY, frame.w, frame.h);
    }
  }

  private drawObstacles(game: Game, alpha: number): void {
    const pool = game.obstacles;
    for (let i = 0; i < pool.activeCount; i += 1) {
      const obstacle = pool.items[i];
      if (!obstacle) {
        continue;
      }
      const x = obstacle.prevX + (obstacle.x - obstacle.prevX) * alpha;
      const stride = obstacle.kind.width + CACTUS.spacing;
      for (let k = 0; k < obstacle.count; k += 1) {
        this.drawSprite(obstacle.kind.sprite, x + k * stride, obstacle.y);
      }
    }
  }

  private drawDino(game: Game, alpha: number): void {
    const dino = game.dino;
    const name = dino.sprite;
    const lift = dino.prevY + (dino.y - dino.prevY) * alpha;
    this.drawSprite(name, DINO.x, groundTop(SPRITES[name].height) - lift);
  }

  private drawHud(game: Game): void {
    const ctx = this.ctx;
    const scale = this.scale;
    const touch = this.coarse.matches;
    ctx.fillStyle = COLORS.hud;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    switch (game.state) {
      case 'start':
        ctx.font = this.hintFont;
        ctx.fillText(touch ? TEXT.hintTouch : TEXT.hintKeyboard, this.centerX, this.startHintY);
        ctx.font = this.smallFont;
        ctx.fillText(touch ? TEXT.controlsTouch : TEXT.controlsKeyboard, this.centerX, this.controlsY);
        if (touch && this.portrait.matches) {
          ctx.fillText(TEXT.rotate, this.centerX, this.rotateY);
        }
        break;
      case 'paused':
        ctx.font = this.titleFont;
        ctx.fillText(TEXT.paused, this.centerX, this.pauseY);
        ctx.font = this.hintFont;
        ctx.fillText(touch ? TEXT.resumeTouch : TEXT.resumeKeyboard, this.centerX, this.pauseHintY);
        break;
      case 'gameover':
        ctx.font = this.titleFont;
        ctx.fillText(TEXT.gameOver, this.centerX, this.titleY);
        if (game.restartAvailable) {
          this.drawRestart(touch);
        }
        break;
      case 'playing':
        if (game.resumeTimer > 0) {
          ctx.font = this.titleFont;
          ctx.fillText(TEXT.getReady, this.centerX, Math.round(HUD.countdownY * scale));
        }
        break;
    }
  }

  private drawRestart(touch: boolean): void {
    const ctx = this.ctx;
    const frame = this.sheet.frames.restart;
    const left = this.centerX - Math.round(this.iconPx / 2);
    const top = this.iconCenterY - Math.round(this.iconPx / 2);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.sheet.canvas, frame.x, frame.y, frame.w, frame.h, left, top, this.iconPx, this.iconPx);
    if (touch && !this.restartHintFits) {
      return;
    }
    ctx.font = this.hintFont;
    ctx.fillText(touch ? TEXT.restartTouch : TEXT.restartKeyboard, this.centerX, this.restartHintY);
  }
}
