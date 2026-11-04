// 4 AI Ghosts with Distinct Targeting Logic & State Machine

import { DIRS } from './Pacman.js';

export const GHOST_NAMES = {
  BLINKY: 'BLINKY',
  PINKY: 'PINKY',
  INKY: 'INKY',
  CLYDE: 'CLYDE'
};

export const GHOST_STATES = {
  HOUSE: 'HOUSE',
  NORMAL: 'NORMAL',
  FRIGHTENED: 'FRIGHTENED',
  EATEN: 'EATEN'
};

export class Ghost {
  constructor(name, color, maze, releaseDelayMs = 0) {
    this.name = name;
    this.baseColor = color;
    this.maze = maze;
    this.tileSize = maze.tileSize;
    this.offsetY = maze.offsetY;
    this.radius = 8;

    this.releaseDelayMs = releaseDelayMs;
    this.releaseTimer = releaseDelayMs;

    this.reset();
  }

  reset() {
    this.releaseTimer = this.releaseDelayMs;
    this.state = this.releaseDelayMs === 0 ? GHOST_STATES.NORMAL : GHOST_STATES.HOUSE;

    // Start coordinates
    if (this.name === GHOST_NAMES.BLINKY) {
      this.x = this.maze.ghostHouse.exit.x * this.tileSize;
      this.y = this.offsetY + this.maze.ghostHouse.exit.y * this.tileSize + this.tileSize / 2;
      this.dir = DIRS.LEFT;
    } else {
      const offsetX = (this.name === GHOST_NAMES.PINKY ? -1 : (this.name === GHOST_NAMES.INKY ? 0 : 1)) * 14;
      this.x = this.maze.ghostHouse.spawn.x * this.tileSize + offsetX;
      this.y = this.offsetY + this.maze.ghostHouse.spawn.y * this.tileSize + this.tileSize / 2;
      this.dir = DIRS.UP;
    }

    this.speed = 2.1;
    this.frightenedTimer = 0;
  }

  setFrightened(durationMs = 8000) {
    if (this.state === GHOST_STATES.EATEN) return;
    this.state = GHOST_STATES.FRIGHTENED;
    this.frightenedTimer = durationMs;
    // Reverse direction immediately upon entering frightened mode
    this.dir = { dx: -this.dir.dx, dy: -this.dir.dy, angle: this.dir.angle + Math.PI };
  }

  getTile() {
    const col = Math.floor(this.x / this.tileSize);
    const row = Math.floor((this.y - this.offsetY) / this.tileSize);
    return { col, row };
  }

  getTarget(pacman, blinky) {
    const pTile = pacman.getTile();

    if (this.state === GHOST_STATES.EATEN) {
      return { col: 13.5, row: 8 }; // Ghost house return
    }

    if (this.state === GHOST_STATES.FRIGHTENED) {
      // Random target
      return { col: Math.random() * 28, row: Math.random() * 19 };
    }

    switch (this.name) {
      case GHOST_NAMES.BLINKY:
        // Chases player directly
        return pTile;

      case GHOST_NAMES.PINKY:
        // 4 tiles ahead of player
        return {
          col: pTile.col + pacman.dir.dx * 4,
          row: pTile.row + pacman.dir.dy * 4
        };

      case GHOST_NAMES.INKY:
        // Flanking vector
        const bTile = blinky ? blinky.getTile() : pTile;
        const pivotCol = pTile.col + pacman.dir.dx * 2;
        const pivotRow = pTile.row + pacman.dir.dy * 2;
        return {
          col: pivotCol + (pivotCol - bTile.col),
          row: pivotRow + (pivotRow - bTile.row)
        };

      case GHOST_NAMES.CLYDE:
        // Pokey: retreats to corner if too close
        const myTile = this.getTile();
        const distToPacman = Math.hypot(myTile.col - pTile.col, myTile.row - pTile.row);
        if (distToPacman > 8) {
          return pTile;
        } else {
          return { col: 1, row: 18 }; // Bottom-left corner
        }

      default:
        return pTile;
    }
  }

  getAvailableDirs() {
    const options = [DIRS.UP, DIRS.LEFT, DIRS.DOWN, DIRS.RIGHT];
    const isGhostHouseAllowed = (this.state === GHOST_STATES.EATEN || this.state === GHOST_STATES.HOUSE);

    return options.filter(d => {
      // Cannot turn 180 degrees backwards during normal motion
      if (d.dx + this.dir.dx === 0 && d.dy + this.dir.dy === 0 && this.state !== GHOST_STATES.HOUSE) {
        return false;
      }

      const checkDist = this.tileSize * 0.55;
      const checkX = this.x + d.dx * checkDist;
      const checkY = this.y + d.dy * checkDist;
      const col = Math.floor(checkX / this.tileSize);
      const row = Math.floor((checkY - this.offsetY) / this.tileSize);

      // Tunnel wrapping row 9
      if (row === 9 && (col < 0 || col >= this.maze.cols)) {
        return true;
      }

      return !this.maze.isWall(col, row, isGhostHouseAllowed);
    });
  }

  update(deltaMs, pacman, blinky) {
    // 1. Ghost House Release countdown
    if (this.state === GHOST_STATES.HOUSE) {
      this.releaseTimer -= deltaMs;
      // Bounce up and down inside house
      this.y += this.dir.dy * 0.8;
      const spawnY = this.offsetY + this.maze.ghostHouse.spawn.y * this.tileSize + this.tileSize / 2;
      if (Math.abs(this.y - spawnY) > 8) {
        this.dir = (this.dir === DIRS.UP) ? DIRS.DOWN : DIRS.UP;
      }

      if (this.releaseTimer <= 0) {
        // Move towards exit gate
        this.x = this.maze.ghostHouse.exit.x * this.tileSize;
        this.y = this.offsetY + this.maze.ghostHouse.exit.y * this.tileSize + this.tileSize / 2;
        this.state = GHOST_STATES.NORMAL;
        this.dir = DIRS.LEFT;
      }
      return;
    }

    // 2. Frightened timer countdown
    if (this.state === GHOST_STATES.FRIGHTENED) {
      this.frightenedTimer -= deltaMs;
      if (this.frightenedTimer <= 0) {
        this.state = GHOST_STATES.NORMAL;
      }
    }

    // 3. Eaten return check
    if (this.state === GHOST_STATES.EATEN) {
      const houseX = this.maze.ghostHouse.exit.x * this.tileSize;
      const houseY = this.offsetY + this.maze.ghostHouse.exit.y * this.tileSize + this.tileSize / 2;
      if (Math.hypot(this.x - houseX, this.y - houseY) < 6) {
        this.state = GHOST_STATES.NORMAL;
        this.dir = DIRS.LEFT;
      }
    }

    // 4. Movement Speed
    let currentSpeed = this.speed;
    if (this.state === GHOST_STATES.FRIGHTENED) currentSpeed *= 0.55;
    else if (this.state === GHOST_STATES.EATEN) currentSpeed *= 2.2;

    // 5. Navigation at tile centers
    const tile = this.getTile();
    const tileCenterX = tile.col * this.tileSize + this.tileSize / 2;
    const tileCenterY = this.offsetY + tile.row * this.tileSize + this.tileSize / 2;
    const distToCenter = Math.hypot(this.x - tileCenterX, this.y - tileCenterY);

    if (distToCenter < 3.2) {
      const available = this.getAvailableDirs();
      if (available.length > 0) {
        const target = this.getTarget(pacman, blinky);
        let bestDir = available[0];
        let bestDist = Infinity;

        for (const cand of available) {
          const nextCol = tile.col + cand.dx;
          const nextRow = tile.row + cand.dy;
          const d = Math.hypot(nextCol - target.col, nextRow - target.row);
          if (d < bestDist) {
            bestDist = d;
            bestDir = cand;
          }
        }

        this.x = tileCenterX;
        this.y = tileCenterY;
        this.dir = bestDir;
      }
    }

    this.x += this.dir.dx * currentSpeed;
    this.y += this.dir.dy * currentSpeed;

    // Tunnel wrapping
    const totalW = this.maze.cols * this.tileSize;
    if (this.x < -10) this.x = totalW + 8;
    else if (this.x > totalW + 10) this.x = -8;
  }

  draw(ctx, timestamp = 0) {
    ctx.save();
    const r = this.radius;
    const px = this.x;
    const py = this.y;

    if (this.state === GHOST_STATES.EATEN) {
      // Draw floating eyes only
      this.drawEyes(ctx, px, py);
      ctx.restore();
      return;
    }

    // Ghost body color
    let bodyColor = this.baseColor;
    if (this.state === GHOST_STATES.FRIGHTENED) {
      // Flash white near expiration
      const flash = (this.frightenedTimer < 2400) && (Math.floor(timestamp / 180) % 2 === 0);
      bodyColor = flash ? '#fff5ea' : '#3a86ff';
    }

    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(px, py - 2, r, Math.PI, 0, false); // Head dome
    ctx.lineTo(px + r, py + r - 2);

    // 3 Wavy skirt tentacles
    const waveW = (r * 2) / 3;
    ctx.lineTo(px + r, py + r);
    ctx.lineTo(px + r - waveW * 0.5, py + r - 3);
    ctx.lineTo(px + r - waveW, py + r);
    ctx.lineTo(px + r - waveW * 1.5, py + r - 3);
    ctx.lineTo(px - r + waveW, py + r);
    ctx.lineTo(px - r + waveW * 0.5, py + r - 3);
    ctx.lineTo(px - r, py + r);
    ctx.closePath();
    ctx.fill();

    // Eyes
    if (this.state === GHOST_STATES.FRIGHTENED) {
      // Frightened face (wiggly pink/white pupils)
      ctx.fillStyle = '#ff758f';
      ctx.fillRect(px - 4, py - 3, 2, 2);
      ctx.fillRect(px + 2, py - 3, 2, 2);
      ctx.fillRect(px - 3, py + 2, 6, 2);
    } else {
      this.drawEyes(ctx, px, py);
    }

    ctx.restore();
  }

  drawEyes(ctx, px, py) {
    const eyeOffsetX = this.dir.dx * 2.5;
    const eyeOffsetY = this.dir.dy * 2.5;

    // Eyeballs
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px - 3.5, py - 3, 3, 0, Math.PI * 2);
    ctx.arc(px + 3.5, py - 3, 3, 0, Math.PI * 2);
    ctx.fill();

    // Pupils looking in movement direction
    ctx.fillStyle = '#1c0a22';
    ctx.beginPath();
    ctx.arc(px - 3.5 + eyeOffsetX, py - 3 + eyeOffsetY, 1.5, 0, Math.PI * 2);
    ctx.arc(px + 3.5 + eyeOffsetX, py - 3 + eyeOffsetY, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}
