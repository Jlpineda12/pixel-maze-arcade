// Automated QA Test Suite for Pixel Maze Arcade 1980
import { MazeMap, TILE_TYPES } from '../src/game/MazeMap.js';
import { Pacman, DIRS } from '../src/game/Pacman.js';
import { Ghost, GHOST_NAMES, GHOST_STATES } from '../src/game/Ghost.js';
import { Fruit, FRUIT_TYPES } from '../src/game/Fruit.js';
import { MazeMusic } from '../src/audio/MazeMusic.js';
import { SoundEffects } from '../src/audio/SoundEffects.js';
import { Game, GAME_STATES } from '../src/game/Game.js';

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n========================================`);
  console.log(`🍒 ${title}`);
  console.log(`========================================`);
}

// ========================================================
// 1. MAZE MAP & TILE SYSTEM TESTS
// ========================================================
section('1. Maze Map & Collision Geometry');

const maze = new MazeMap(20, 38);
assert(maze.cols === 28, 'Maze contains 28 columns (560px / 20px)');
assert(maze.rows === 19, 'Maze contains 19 rows');
assert(maze.totalDots > 100, `Maze initializes with ${maze.totalDots} edible dots/energizers`);
assert(maze.dotsRemaining === maze.totalDots, 'Initial remaining dots equals total dots');

// Wall collisions
assert(maze.isWall(0, 0, false) === true, 'Top-left corner is a solid wall');
assert(maze.isWall(1, 1, false) === false, 'Tile (1, 1) is an open hallway');
assert(maze.isWall(13, 8, false) === true, 'Pacman cannot cross ghost house gate');
assert(maze.isWall(13, 8, true) === false, 'Ghosts can traverse ghost house gate');

// Dot consumption
const dotRes = maze.eatDot(1, 1);
assert(dotRes !== null && (dotRes.type === 'dot' || dotRes.type === 'energizer'), 'Eating a dot returns valid reward object');
assert(maze.dotsRemaining === maze.totalDots - 1, 'Remaining dot counter decrements');

// Tunnel Opening
assert(maze.isWall(-1, 9, false) === false, 'Tunnel opening left allows passage');
assert(maze.isWall(28, 9, false) === false, 'Tunnel opening right allows passage');

// ========================================================
// 2. PACMAN PLAYER MECHANICS
// ========================================================
section('2. Pacman Mechanics & Input Buffering');

const pacman = new Pacman(maze);
assert(pacman.x === 13.5 * 20, 'Pacman initializes at designated starting X');
assert(pacman.dir === DIRS.LEFT, 'Pacman initially faces LEFT');
assert(pacman.radius === 8, 'Pacman radius is 8px');

// Immediate 180-degree turn
pacman.setDirection(DIRS.RIGHT);
assert(pacman.dir === DIRS.RIGHT, 'Immediate 180-degree reversal is applied instantly');

// Movement
const initialX = pacman.x;
pacman.update(16);
assert(pacman.x > initialX, 'Pacman moves right when facing right');

// Tunnel Wrapping (row 9 is the warp tunnel)
pacman.y = maze.offsetY + 9 * maze.tileSize + maze.tileSize / 2;
pacman.dir = DIRS.LEFT;
pacman.nextDir = DIRS.LEFT;
pacman.x = -12;
pacman.update(16);
assert(pacman.x > 500, 'Pacman wraps seamlessly to right side when exiting left tunnel');

pacman.dir = DIRS.RIGHT;
pacman.nextDir = DIRS.RIGHT;
pacman.x = 580;
pacman.update(16);
assert(pacman.x < 10, 'Pacman wraps seamlessly to left side when exiting right tunnel');

// ========================================================
// 3. 4 AI GHOSTS & TARGETING ALGORITHMS
// ========================================================
section('3. 4 AI Ghosts & Targeting Personalities');

const blinky = new Ghost(GHOST_NAMES.BLINKY, '#ff334b', maze, 0);
const pinky = new Ghost(GHOST_NAMES.PINKY, '#ff758f', maze, 2000);
const inky = new Ghost(GHOST_NAMES.INKY, '#00f5d4', maze, 4000);
const clyde = new Ghost(GHOST_NAMES.CLYDE, '#fda415', maze, 6000);

assert(blinky.state === GHOST_STATES.NORMAL, 'Blinky starts immediately in NORMAL chase state');
assert(pinky.state === GHOST_STATES.HOUSE, 'Pinky starts inside ghost house');
assert(inky.state === GHOST_STATES.HOUSE, 'Inky starts inside ghost house');
assert(clyde.state === GHOST_STATES.HOUSE, 'Clyde starts inside ghost house');

// Blinky Targeting (direct chase)
const bTarget = blinky.getTarget(pacman, null);
const pTile = pacman.getTile();
assert(bTarget.col === pTile.col && bTarget.row === pTile.row, 'Blinky targets Pacman tile directly');

// Pinky Targeting (4 tiles ahead)
pacman.dir = DIRS.RIGHT;
const pinkyTarget = pinky.getTarget(pacman, blinky);
assert(pinkyTarget.col === pTile.col + 4, 'Pinky targets 4 tiles ahead of Pacman');

// Clyde Proximity Retreat
clyde.state = GHOST_STATES.NORMAL;
clyde.x = pacman.x + 20; // very close (<8 tiles)
clyde.y = pacman.y;
const clydeRetreat = clyde.getTarget(pacman, blinky);
assert(clydeRetreat.col === 1 && clydeRetreat.row === 18, 'Clyde retreats to bottom-left corner when close');

// Frightened State
blinky.setFrightened(8000);
assert(blinky.state === GHOST_STATES.FRIGHTENED, 'Ghost enters FRIGHTENED state');
assert(blinky.frightenedTimer === 8000, 'Frightened timer initialized to 8000ms');

// ========================================================
// 4. BONUS FRUIT MECHANICS
// ========================================================
section('4. Bonus Fruit Entities');

const fruit = new Fruit(maze);
assert(fruit.active === false, 'Fruit starts inactive');
fruit.spawn(1);
assert(fruit.active === true, 'Fruit activates on spawn');
assert(fruit.currentFruit.name === 'CHERRY', 'Level 1 spawns CHERRY');
assert(fruit.currentFruit.points === 100, 'Cherry rewards 100 points');

fruit.spawn(2);
assert(fruit.currentFruit.name === 'STRAWBERRY', 'Level 2 spawns STRAWBERRY');

fruit.spawn(3);
assert(fruit.currentFruit.name === 'ORANGE', 'Level 3 spawns ORANGE');

// ========================================================
// 5. PROCEDURAL AUDIO ENGINE
// ========================================================
section('5. Procedural Audio Engine');

const mockSynth = {
  ctx: { currentTime: 0 },
  initialized: true,
  playTone: () => {},
  playNoise: () => {},
  masterGain: {}
};

const sfx = new SoundEffects(mockSynth);
assert(sfx.wakaAlt === false, 'Waka starts in default toggle state');
sfx.waka();
assert(sfx.wakaAlt === true, 'Waka alternates frequency state');

const music = new MazeMusic(mockSynth);
assert(music.menuBpm === 112, 'Menu plays at 112 BPM');
assert(music.mazeBpm === 120, 'Maze gameplay drives at 120 BPM');
assert(music.frightenedBpm === 144, 'Frightened mode accelerates to 144 BPM');

// ========================================================
// 6. GAME CONTROLLER & MENU INTEGRATION
// ========================================================
section('6. Game State & Menu Controls Integration');

const mockCanvas = {
  getContext: () => ({
    save: () => {},
    restore: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    fillText: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    quadraticCurveTo: () => {},
    closePath: () => {},
    fill: () => {},
    stroke: () => {},
    clip: () => {},
    rect: () => {},
    arc: () => {},
    translate: () => {},
    rotate: () => {}
  }),
  addEventListener: () => {}
};

const mockMazeSfx = {
  coinInsert: () => {},
  menuMove: () => {},
  menuConfirm: () => {},
  waka: () => {},
  energizer: () => {},
  eatGhost: () => {},
  eatFruit: () => {},
  death: () => {},
  levelCleared: () => {},
  gameOver: () => {}
};

const mockMazeMusic = {
  start: () => {},
  stop: () => {},
  setMode: () => {}
};

global.window = {
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.localStorage = {
  getItem: () => '123000',
  setItem: () => {}
};
global.performance = {
  now: () => 1000
};

const game = new Game(mockCanvas, mockSynth, mockMazeSfx, mockMazeMusic);
assert(game.state === GAME_STATES.MENU, 'Game initializes in MENU state');
assert(game.lives === 5, 'Player starts with 5 lives (orange pixel hearts)');
assert(game.ghosts.length === 4, 'Game initializes with 4 AI ghosts');

// Start Game
game.startGame();
assert(game.state === GAME_STATES.PLAYING, 'Game enters PLAYING state');

// Eating Frightened Ghosts combo multiplier
game.ghostCombo = 0;
game.ghosts[0].setFrightened(8000);
game.ghosts[0].x = game.pacman.x;
game.ghosts[0].y = game.pacman.y;
game.update(16);
assert(game.ghosts[0].state === GHOST_STATES.EATEN, 'Frightened ghost is eaten upon contact');
assert(game.score === 200, 'First ghost rewards 200 points');
assert(game.ghostCombo === 1, 'Ghost combo increments to 1');

// Player death when colliding with normal ghost
game.ghosts[1].state = GHOST_STATES.NORMAL;
game.ghosts[1].x = game.pacman.x;
game.ghosts[1].y = game.pacman.y;
game.update(16);
assert(game.lives === 4, 'Lives decrement by 1 on contact with normal ghost');

// Game Over when lives reach 0
game.lives = 1;
game.handlePlayerDeath();
assert(game.lives === 0, 'Lives reach 0');
assert(game.state === GAME_STATES.GAME_OVER, 'State transitions to GAME_OVER');

// ========================================================
// SUMMARY
// ========================================================
console.log(`\n========================================`);
console.log(`🏁 QA RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}

// Exit explicitly: audio sequencer timers would otherwise keep Node alive
process.exit(failed > 0 ? 1 : 0);
