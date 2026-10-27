import { VIEWPORT, WORLD } from '../config';

export interface ViewportSize {
  pixelScale: number;
  bufferWidth: number;
  bufferHeight: number;
  cssWidth: number;
  cssHeight: number;
}

export function computeViewport(availableWidth: number, availableHeight: number, dpr: number): ViewportSize {
  const raw = Math.max(Math.min((availableWidth * dpr) / WORLD.width, (availableHeight * dpr) / WORLD.height), 0.01);
  const integer = Math.floor(raw);
  const pixelScale = integer >= 2 && integer / raw >= VIEWPORT.minIntegerFill ? integer : raw;
  const bufferWidth = Math.round(WORLD.width * pixelScale);
  const bufferHeight = Math.round(WORLD.height * pixelScale);

  return {
    pixelScale,
    bufferWidth,
    bufferHeight,
    cssWidth: bufferWidth / dpr,
    cssHeight: bufferHeight / dpr,
  };
}

export function fitCanvas(canvas: HTMLCanvasElement, container: HTMLElement, onResize: (size: ViewportSize) => void): void {
  const apply = (): void => {
    const style = getComputedStyle(container);
    const width = container.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const height = container.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    const size = computeViewport(width, height, window.devicePixelRatio || 1);

    canvas.width = size.bufferWidth;
    canvas.height = size.bufferHeight;
    canvas.style.width = `${size.cssWidth}px`;
    canvas.style.height = `${size.cssHeight}px`;
    onResize(size);
  };

  let dprQuery: MediaQueryList | null = null;
  const onDprChange = (): void => {
    apply();
    watchDpr();
  };
  const watchDpr = (): void => {
    dprQuery?.removeEventListener('change', onDprChange);
    dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    dprQuery.addEventListener('change', onDprChange);
  };

  new ResizeObserver(apply).observe(container);
  window.addEventListener('resize', apply);
  watchDpr();
  apply();
}
