import './style.css';
import { COLORS, WORLD } from './config';
import { fitCanvas, type ViewportSize } from './render/viewport';

const canvas = document.querySelector<HTMLCanvasElement>('#game');
const stage = document.querySelector<HTMLElement>('#stage');
const ctx = canvas?.getContext('2d');

if (!canvas || !stage || !ctx) {
  throw new Error('Canvas is not available');
}

const draw = (size: ViewportSize): void => {
  ctx.setTransform(size.pixelScale, 0, 0, size.pixelScale, 0, 0);
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  ctx.fillStyle = COLORS.foreground;
  ctx.fillRect(0, WORLD.groundY, WORLD.width, 1);

  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Нажмите пробел', WORLD.width / 2, WORLD.height / 2);
};

fitCanvas(canvas, stage, draw);
