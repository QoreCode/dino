import './style.css';
import { GAME, WORLD } from './config';
import { FixedStepper, GameLoop } from './core/loop';
import { Input } from './core/input';
import { Game } from './game/state';
import { Renderer } from './render/renderer';
import { buildSpriteSheet } from './render/sprites';
import { fitCanvas } from './render/viewport';

const canvas = document.querySelector<HTMLCanvasElement>('#game');
const stage = document.querySelector<HTMLElement>('#stage');
const ctx = canvas?.getContext('2d');

if (!canvas || !stage || !ctx) {
  throw new Error('Canvas is not available');
}

const input = new Input(canvas, stage);
const game = new Game(input, Math.random);
const renderer = new Renderer(ctx, buildSpriteSheet());
const loop = new GameLoop(
  new FixedStepper(GAME.fixedStep, GAME.maxFrameTime),
  (dt) => game.update(dt),
  (alpha) => renderer.render(game, alpha),
);

const sync = (): void => {
  if (game.state === 'paused') {
    loop.stop();
    renderer.render(game, 1);
  } else {
    loop.start();
  }
};

const pauseGame = (): void => {
  game.releaseHeld();
  game.pause();
  sync();
};

input.onWake = () => {
  if (!loop.running) {
    game.update(0);
    sync();
  }
};

input.attach();
window.addEventListener('blur', pauseGame);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    pauseGame();
  }
});

fitCanvas(canvas, stage, (size) => {
  renderer.resize(size);
  game.setCssPerWorld(size.cssWidth / WORLD.width);
  renderer.render(game, 1);
});

loop.start();
