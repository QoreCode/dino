export const WORLD = {
  width: 600,
  height: 150,
  groundY: 127,
  objectSink: 1,
} as const;

export const VIEWPORT = {
  minIntegerFill: 0.8,
} as const;

export const COLORS = {
  skyTop: '#3a97e6',
  skyBottom: '#bfe5fa',
  hud: '#0b2239',
  groundFill: '#e5cb93',
  groundLine: '#8b6a34',
  groundSpeck: '#c9a96b',
  groundSpeckDark: '#ad8b50',
} as const;

export const PALETTE: Readonly<Record<string, string>> = {
  r: '#d94a2f',
  d: '#6e1a12',
  b: '#f7cf7f',
  y: '#ffd447',
  w: '#ffffff',
  k: '#1b1b1b',
  g: '#2e9444',
  G: '#14522a',
  h: '#5cc06e',
  c: '#ffffff',
  C: '#d6e8f7',
  m: '#8dc28b',
  M: '#79b078',
  n: '#a7d4a3',
  a: '#5f9d57',
  p: '#a38a62',
  P: '#85703f',
  i: '#0b2239',
};

export const GAME = {
  fixedStep: 1 / 60,
  maxFrameTime: 0.25,
  startSpeed: 320,
  maxSpeed: 640,
  acceleration: 5,
  restartLockTime: 0.4,
  resumeDelay: 0.6,
} as const;

export const DINO = {
  x: 40,
  jumpVelocity: 480,
  gravity: 2200,
  holdGravityMultiplier: 0.6,
  maxJumpHoldTime: 0.2,
  fastFallMultiplier: 3,
  jumpBufferTime: 0.1,
  runStepDistance: 30,
} as const;

export const CACTUS = {
  spacing: 3,
  maxGroup: 3,
  poolCapacity: 6,
  gapSafetyFactor: 1.15,
  gapRandomness: 140,
  firstSpawnDistance: 380,
} as const;

export interface HitBox {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export const HITBOXES = {
  dinoStand: [
    { x: 18, y: 3, w: 10, h: 7 },
    { x: 7, y: 11, w: 19, h: 10 },
    { x: 9, y: 22, w: 10, h: 5 },
  ],
  dinoDuck: [
    { x: 24, y: 3, w: 10, h: 6 },
    { x: 2, y: 8, w: 30, h: 6 },
    { x: 7, y: 14, w: 13, h: 3 },
  ],
  cactusSmall: [
    { x: 5, y: 2, w: 4, h: 24 },
    { x: 11, y: 5, w: 2, h: 8 },
    { x: 1, y: 11, w: 2, h: 8 },
  ],
  cactusLarge: [
    { x: 6, y: 2, w: 6, h: 34 },
    { x: 15, y: 8, w: 2, h: 10 },
    { x: 1, y: 13, w: 2, h: 11 },
  ],
} as const satisfies Record<string, readonly HitBox[]>;

export const TOUCH = {
  swipeThreshold: 30,
  duckCancelJumpTime: 0.1,
  duckCancelMaxHeight: 16,
  minHitSize: 44,
} as const;

export interface LayerConfig {
  readonly capacity: number;
  readonly speedFactor: number;
  readonly sprites: readonly (
    | 'cloudSmall'
    | 'cloudBig'
    | 'bush'
    | 'bushSmall'
    | 'hill'
    | 'grass'
    | 'grassSmall'
    | 'pebble'
    | 'pebbleSmall'
  )[];
  readonly spacingMin: number;
  readonly spacingMax: number;
  readonly anchor: 'top' | 'bottom';
  readonly yMin: number;
  readonly yMax: number;
}

export const CLOUDS = {
  idleSpeed: 40,
  far: {
    capacity: 8,
    speedFactor: 0.2,
    sprites: ['cloudSmall'],
    spacingMin: 50,
    spacingMax: 170,
    anchor: 'top',
    yMin: 6,
    yMax: 38,
  },
  near: {
    capacity: 8,
    speedFactor: 0.4,
    sprites: ['cloudBig', 'cloudSmall'],
    spacingMin: 120,
    spacingMax: 280,
    anchor: 'top',
    yMin: 16,
    yMax: 48,
  },
} as const satisfies { idleSpeed: number; far: LayerConfig; near: LayerConfig };

export const DECOR = {
  far: {
    capacity: 20,
    speedFactor: 0.5,
    sprites: ['bush', 'bushSmall', 'hill', 'bushSmall'],
    spacingMin: 24,
    spacingMax: 130,
    anchor: 'bottom',
    yMin: 127,
    yMax: 127,
  },
  near: {
    capacity: 48,
    speedFactor: 1,
    sprites: ['grass', 'grassSmall', 'pebble', 'pebbleSmall', 'grass'],
    spacingMin: 14,
    spacingMax: 64,
    anchor: 'top',
    yMin: 124,
    yMax: 141,
  },
} as const satisfies { far: LayerConfig; near: LayerConfig };

export const GROUND = {
  tileWidth: 120,
  seed: 1337,
  speckDensity: 0.035,
} as const;

export const HUD = {
  font: 'monospace',
  hintSize: 10,
  titleSize: 16,
  smallSize: 8,
  minHintCssPx: 12,
  minTitleCssPx: 20,
  minSmallCssPx: 11,
  minRestartIconCssPx: 32,
  hintY: 50,
  controlsY: 64,
  rotateY: 78,
  pauseY: 48,
  pauseHintY: 66,
  countdownY: 60,
  gameOverY: 40,
  restartY: 74,
  restartGap: 4,
} as const;

export const TEXT = {
  hintKeyboard: 'Нажмите пробел',
  hintTouch: 'Коснитесь экрана',
  controlsKeyboard: 'Вверх / пробел - прыжок, вниз - присед',
  controlsTouch: 'Тап - прыжок, свайп вниз - присед',
  rotate: 'Поверните телефон',
  paused: 'Пауза',
  resumeKeyboard: 'Нажмите пробел, чтобы продолжить',
  resumeTouch: 'Коснитесь экрана, чтобы продолжить',
  getReady: 'Приготовьтесь',
  gameOver: 'GAME OVER',
  restartKeyboard: 'Пробел - заново',
  restartTouch: 'Коснитесь, чтобы начать заново',
} as const;
