export interface SpriteMatrix {
  readonly rows: readonly string[];
  readonly width: number;
  readonly height: number;
}

function matrix(rows: readonly string[]): SpriteMatrix {
  const first = rows[0];
  if (first === undefined) {
    throw new Error('Empty sprite matrix');
  }
  const width = first.length;
  for (const row of rows) {
    if (row.length !== width) {
      throw new Error(`Ragged sprite matrix: expected ${width} columns, got ${row.length} in "${row}"`);
    }
  }
  return { rows, width, height: rows.length };
}

const DINO_HEAD: readonly string[] = [
  '...................y....y.....',
  '...................d....d.....',
  '.................ddddddddddd..',
  '................drrrrrrrrrrrrd',
  '................drrrrwkrrrrrrd',
  '................drrrrrrrrrrrrd',
  '................drrrrrrrrrkrrd',
  '.................dbbbbbbbbbbbd',
  '.................ddddddddddddd',
  '...............drrrrrrrd......',
  '.............ydrrrrrrrrd......',
];

const DINO_HEAD_DEAD: readonly string[] = [
  '...................y....y.....',
  '...................d....d.....',
  '.................ddddddddddd..',
  '................drrrrrrrrrrrrd',
  '................drrrkkrrrrrrrd',
  '................drrrrrrrrrrrrd',
  '................drrrrrrrrrkrrd',
  '.................dbbbbbbbbbbbd',
  '.................ddddddddddddd',
  '...............drrrrrrrd......',
  '.............ydrrrrrrrrd......',
];

const DINO_BODY: readonly string[] = [
  '...........yydrrrrrrrrrrd.....',
  '.........yydrrrrrrrrrrrrrd....',
  '.......yydrrrrrrrrrrrrrrrrd...',
  '......ydrrrrrrrrrrrrrrrrbbrd..',
  '.....drrrrrrrrrrrrrrrrrbbbbrd.',
  'yy.ddrrrrrrrrrrrrrrrrrrbbbbbd.',
  'dyddrrrrrrrrrrrrrrrrrrrbbbbbd.',
  '.dddrrrrrrrrrrrrrrrrrrrbbbbbd.',
  '..dddrrrrrrrrrrrrrrrrrrbbbbd..',
  '....ddrrrrrrrrrrrrrrrrrrrrd...',
  '.....dddrrrrrrrrrrrrrrrddd....',
];

const DINO_LEGS_A: readonly string[] = [
  '.......drrd.....drrd..........',
  '.......drrd.....drrd..........',
  '.......drrd.....dddd..........',
  '.......drrd...................',
  '.......dddd...................',
  '......dddddd..................',
];

const DINO_LEGS_B: readonly string[] = [
  '.......drrd.....drrd..........',
  '.......drrd.....drrd..........',
  '.......dddd.....drrd..........',
  '................drrd..........',
  '................dddd..........',
  '...............dddddd.........',
];

const DINO_LEGS_JUMP: readonly string[] = [
  '.......drrd.....drrd..........',
  '.......drrd.....drrd..........',
  '.......drrd.....drrd..........',
  '.......drrd.....drrd..........',
  '.......dddd.....dddd..........',
  '......dddddd...dddddd.........',
];

const DINO_DUCK_TOP: readonly string[] = [
  '..........................y....y....',
  '..........................d....d....',
  '........................ddddddddddd.',
  '......................drrrrrrrrrrrrd',
  '......................drrrrwkrrrrrrd',
  '......................drrrrrrrrrrrrd',
  '.yy.yy.yy.yy..........drrrrrrrrrkrrd',
  'dyddyddyddyddd.......dbbbbbbbbbbbbbd',
  'drrrrrrrrrrrrrrrdddddddddddddddddddd',
  'drrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrd..',
  'drrrrrrrrrrrrrrrrrrrrrrrrbbbbbbbd...',
  '.ddrrrrrrrrrrrrrrrrrrrrrbbbbbbbbd...',
  '..dddrrrrrrrrrrrrrrrrrrrrrrrrrdd....',
  '....ddddrrrrrrrrrrrrrrrrrrrddd......',
];

const DINO_DUCK_LEGS_A: readonly string[] = [
  '......drrd.........drrd.............',
  '......drrd.........dddd.............',
  '......dddd..........................',
  '.....dddddd.........................',
];

const DINO_DUCK_LEGS_B: readonly string[] = [
  '......drrd.........drrd.............',
  '......dddd.........drrd.............',
  '...................dddd.............',
  '..................dddddd............',
];

const DINO_DUCK_DEAD_TOP: readonly string[] = DINO_DUCK_TOP.map((row, index) => (index === 4 ? '......................drrrkkrrrrrrrd' : row));



const CACTUS_SMALL: readonly string[] = [
  '.....GGGG.....',
  '....GhgggG....',
  '....GhgggG....',
  '....GhgggG....',
  '....GhgggG..G.',
  '....GhgggG.GhG',
  '....GhgggG.GhG',
  '....GhgggG.GhG',
  '....GhgggG.GhG',
  '....GhgggG.GhG',
  '.G..GhgggG.GhG',
  'GhG.GhggggGhgG',
  'GhG.GhgggggggG',
  'GhG.GhggggGGGG',
  'GhG.GhgggG....',
  'GhG.GhgggG....',
  'GhG.GhgggG....',
  'GhgGhggggG....',
  'GhgggggggG....',
  'GGGGhggggG....',
  '....GhgggG....',
  '....GhgggG....',
  '....GhgggG....',
  '....GhgggG....',
  '....GhgggG....',
  '....GhgggG....',
  '....GhgggG....',
  '....GGGGGG....',
];

const CACTUS_LARGE: readonly string[] = [
  '......GGGGGG......',
  '.....GhgggggG.....',
  '.....GhgggggG.....',
  '.....GhgggggG.....',
  '.....GhgggggG.....',
  '.....GhgggggG.....',
  '.....GhgggggG..GG.',
  '.....GhgggggG.GhgG',
  '.....GhgggggG.GhgG',
  '.....GhgggggG.GhgG',
  '.....GhgggggG.GhgG',
  '.....GhgggggG.GhgG',
  '.GG..GhgggggG.GhgG',
  'GhgG.GhgggggG.GhgG',
  'GhgG.GhgggggG.GhgG',
  'GhgG.GhgggggG.GhgG',
  'GhgG.GhggggggGhggG',
  'GhgG.GhggggggggggG',
  'GhgG.GhggggggggggG',
  'GhgG.GhggggggGGGGG',
  'GhgG.GhgggggG.....',
  'GhgG.GhgggggG.....',
  'GhggGhggggggG.....',
  'GhggggggggggG.....',
  'GhggggggggggG.....',
  'GGGGGhggggggG.....',
  '.....GhgggggG.....',
  '.....GhgggggG.....',
  '.....GhgggggG.....',
  '.....GhgggggG.....',
  '.....GhgggggG.....',
  '.....GhgggggG.....',
  '.....GhgggggG.....',
  '.....GhgggggG.....',
  '.....GhgggggG.....',
  '.....GhgggggG.....',
  '.....GhgggggG.....',
  '.....GGGGGGGG.....',
];

const CLOUD_SMALL: readonly string[] = [
  '..........cccc............',
  '.........cccccc...........',
  '........cccccccc..........',
  '....cccccccccccc.cccc.....',
  '...cccccccccccccccccccccc.',
  '...cccccccccccccccccccccc.',
  '...ccccccccccccCcccccccccC',
  '...CccccCCccccC.Ccccccccc.',
  '....CCCC..CCCC...CCCCCCCC.',
];

const CLOUD_BIG: readonly string[] = [
  '...............cccccc.........................',
  '..............cccccccc........................',
  '.............cccccccccc...cccccc..............',
  '............cccccccccccccccccccccc............',
  '...........ccccccccccccccccccccccc............',
  '.......cccccccccccccccccccccccccccc.cccc......',
  '.....ccccccccccccccccccccccccccccccccccccc....',
  '.....ccccccccccccccccccccccccccccccccccccc....',
  '....ccccccccccccccccccccccccccccccccccccccc...',
  '....ccccccccccccccccccccccccccccccccccccccc...',
  '....ccccccccccccccccccccccccccccccccccccccc...',
  '....CccccccccCccccccccccccccccccccccccccccC...',
  '.....cccccccc.CcccccccccccccccccCCcccccccc....',
  '.....CCccccCC..CCCCccccccccccCCC..CCccccCC....',
  '.......CCCC........CCCCCCCCCC.......CCCC......',
];

const BUSH: readonly string[] = [
  '.........mmmmmm.........',
  '........mmmmmmmm........',
  '.......mmmmmmmmmm.......',
  '......mmmmmmmmmmmm......',
  '......mmmmmmmmmmmmmmm...',
  '...mmmmmmmmmmmmmmmmmmm..',
  '..mmmmmmmmmmmmmmmmmmmmm.',
  '..mmmmmmmmmmmmmmmmmmmmm.',
  '..mmmmmmmmmmmmmmmmmmmmm.',
  '..mmmmmmmmmmmmmmmmmmmmm.',
  '..MmmmmmmmmmmmmmmmmmmmM.',
  '..MMMMMMMMMMMMMMMMMMMMM.',
  '...MMMMMMMMMMMMMMMMMMM..',
];

const BUSH_SMALL: readonly string[] = [
  '.......mmmm....',
  '......mmmmmm...',
  '..mmmmmmmmmmm..',
  '.mmmmmmmmmmmmmm',
  'Mmmmmmmmmmmmmmm',
  'Mmmmmmmmmmmmmmm',
  '.MMMMMMMMMMMMMM',
  '.MMMMMMMMMMMMMM',
];

const HILL: readonly string[] = [
  '..........................nnnnnnnnnnnn..........................',
  '......................nnnnnnnnnnnnnnnnnnnn......................',
  '..................nnnnnnnnnnnnnnnnnnnnnnnnnnnn..................',
  '................nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn................',
  '..............nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn..............',
  '............nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn............',
  '..........nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn..........',
  '.........nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn.........',
  '.......nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn.......',
  '......nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn......',
  '....nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn....',
  '...nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn...',
  '..nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn..',
  '.nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn.',
];

const GRASS: readonly string[] = [
  'a.a.a',
  'a.a.a',
  'aaaaa',
  '.aaa.',
];

const GRASS_SMALL: readonly string[] = [
  'a.a',
  'aaa',
];

const PEBBLE: readonly string[] = [
  '.pp.',
  'pppP',
];

const PEBBLE_SMALL: readonly string[] = [
  'pP',
];

const RESTART_ICON: readonly string[] = [
  '......................',
  '..............i.......',
  '..............ii......',
  '.......iiiiiiiii......',
  '......iiiiiiiiiii.....',
  '....iiiiiiiiiiiiii....',
  '....iiii.....iiiii....',
  '...iiii.....ii........',
  '..iiii................',
  '..iii..............i..',
  '..iii............iii..',
  '..iii............iii..',
  '..iii............iii..',
  '..iii............iii..',
  '..iii............iii..',
  '..iiii..........iiii..',
  '...iiii........iiii...',
  '....iiii......iiii....',
  '....iiiiiiiiiiiiii....',
  '......iiiiiiiiii......',
  '.......iiiiiiii.......',
  '......................',
];

export const SPRITES = {
  dinoRun1: matrix([...DINO_HEAD, ...DINO_BODY, ...DINO_LEGS_A]),
  dinoRun2: matrix([...DINO_HEAD, ...DINO_BODY, ...DINO_LEGS_B]),
  dinoJump: matrix([...DINO_HEAD, ...DINO_BODY, ...DINO_LEGS_JUMP]),
  dinoDead: matrix([...DINO_HEAD_DEAD, ...DINO_BODY, ...DINO_LEGS_JUMP]),
  dinoDuck1: matrix([...DINO_DUCK_TOP, ...DINO_DUCK_LEGS_A]),
  dinoDuck2: matrix([...DINO_DUCK_TOP, ...DINO_DUCK_LEGS_B]),
  dinoDuckDead: matrix([...DINO_DUCK_DEAD_TOP, ...DINO_DUCK_LEGS_A]),
  cactusSmall: matrix(CACTUS_SMALL),
  cactusLarge: matrix(CACTUS_LARGE),
  cloudSmall: matrix(CLOUD_SMALL),
  cloudBig: matrix(CLOUD_BIG),
  bush: matrix(BUSH),
  bushSmall: matrix(BUSH_SMALL),
  hill: matrix(HILL),
  grass: matrix(GRASS),
  grassSmall: matrix(GRASS_SMALL),
  pebble: matrix(PEBBLE),
  pebbleSmall: matrix(PEBBLE_SMALL),
  restart: matrix(RESTART_ICON),
} as const;

export type SpriteName = keyof typeof SPRITES;
