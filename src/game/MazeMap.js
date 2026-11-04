// 28x19 Retro Maze Grid & Tile System

export const TILE_TYPES = {
  EMPTY: 0,
  WALL: 1,
  DOT: 2,
  ENERGIZER: 3,
  GHOST_HOUSE: 4,
  GATE: 5
};

export const RAW_MAZE = [
  "1111111111111111111111111111",
  "13..11....11....11....11..31",
  "1.1.11.11.11.11.11.11.11.1.1",
  "1.1....11..........11....1.1",
  "1.1111.11.11111111.11.1111.1",
  "1......11....11....11......1",
  "111111.11111.11.11111.111111",
  "000001.11..........11.100000",
  "111111.11.11155111.11.111111",
  "0..... ...14444441... .....0",
  "111111.11.11111111.11.111111",
  "000001.11..........11.100000",
  "111111.11.11111111.11.111111",
  "1............11............1",
  "1.1111.11111.11.11111.1111.1",
  "13..11.......  ......11..31",
  "111.11.11.11111111.11.11.111",
  "1......11....11....11......1",
  "1111111111111111111111111111"
];

export class MazeMap {
  constructor(tileSize = 20, offsetY = 38) {
    this.tileSize = tileSize;
    this.offsetY = offsetY;
    this.cols = 28;
    this.rows = 19;
    this.grid = [];
    this.totalDots = 0;
    this.dotsRemaining = 0;

    this.pacmanStart = { x: 13.5, y: 15 };
    this.ghostHouse = {
      spawn: { x: 13.5, y: 9 },
      exit: { x: 13.5, y: 7 }
    };

    this.init();
  }

  init() {
    this.grid = [];
    this.totalDots = 0;

    for (let r = 0; r < this.rows; r++) {
      const row = [];
      const line = RAW_MAZE[r];
      for (let c = 0; c < this.cols; c++) {
        const ch = line[c];
        if (ch === '1') {
          row.push(TILE_TYPES.WALL);
        } else if (ch === '.') {
          row.push(TILE_TYPES.DOT);
          this.totalDots++;
        } else if (ch === '3') {
          row.push(TILE_TYPES.ENERGIZER);
          this.totalDots++;
        } else if (ch === '4') {
          row.push(TILE_TYPES.GHOST_HOUSE);
        } else if (ch === '5') {
          row.push(TILE_TYPES.GATE);
        } else {
          row.push(TILE_TYPES.EMPTY);
        }
      }
      this.grid.push(row);
    }
    this.dotsRemaining = this.totalDots;
  }

  isWall(col, row, isGhost = false) {
    // Tunnel wrapping handles boundaries outside grid
    if (col < 0 || col >= this.cols) {
      return false; // Tunnel opening
    }
    if (row < 0 || row >= this.rows) {
      return true;
    }

    const tile = this.grid[row][col];
    if (tile === TILE_TYPES.WALL) return true;
    if (tile === TILE_TYPES.GATE) return !isGhost; // Ghosts can traverse gate
    if (tile === TILE_TYPES.GHOST_HOUSE) return !isGhost;
    return false;
  }

  eatDot(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return null;
    const tile = this.grid[row][col];

    if (tile === TILE_TYPES.DOT) {
      this.grid[row][col] = TILE_TYPES.EMPTY;
      this.dotsRemaining--;
      return { type: 'dot', points: 10 };
    } else if (tile === TILE_TYPES.ENERGIZER) {
      this.grid[row][col] = TILE_TYPES.EMPTY;
      this.dotsRemaining--;
      return { type: 'energizer', points: 50 };
    }
    return null;
  }

  draw(ctx, timestamp = 0) {
    ctx.save();
    const ts = this.tileSize;
    const oy = this.offsetY;

    // Energizer blinking phase
    const energizerVisible = Math.floor(timestamp / 220) % 2 === 0;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const tile = this.grid[r][c];
        const px = c * ts;
        const py = oy + r * ts;

        if (tile === TILE_TYPES.WALL) {
          // Retro Double-Line / Beveled Wall Block
          ctx.fillStyle = '#241a38';
          ctx.fillRect(px, py, ts, ts);

          ctx.strokeStyle = '#4a488a';
          ctx.lineWidth = 2;
          ctx.strokeRect(px + 1, py + 1, ts - 2, ts - 2);

          ctx.fillStyle = '#6060a8';
          ctx.fillRect(px + 4, py + 4, ts - 8, ts - 8);
        } else if (tile === TILE_TYPES.GATE) {
          // Ghost House Gate
          ctx.fillStyle = '#ff758f';
          ctx.fillRect(px, py + ts / 2 - 2, ts, 4);
        } else if (tile === TILE_TYPES.DOT) {
          // Food Pellet
          ctx.fillStyle = '#fda415';
          ctx.fillRect(px + ts / 2 - 2, py + ts / 2 - 2, 4, 4);
        } else if (tile === TILE_TYPES.ENERGIZER && energizerVisible) {
          // Flashing Power Energizer
          ctx.fillStyle = '#fda415';
          ctx.beginPath();
          ctx.arc(px + ts / 2, py + ts / 2, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fff5ea';
          ctx.beginPath();
          ctx.arc(px + ts / 2 - 1, py + ts / 2 - 1, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
  }
}
