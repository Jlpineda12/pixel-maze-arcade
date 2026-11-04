// Pacman Player Entity with Input Buffering & Tile Grid Snapping

export const DIRS = {
  NONE: { dx: 0, dy: 0, angle: 0 },
  UP: { dx: 0, dy: -1, angle: -Math.PI / 2 },
  DOWN: { dx: 0, dy: 1, angle: Math.PI / 2 },
  LEFT: { dx: -1, dy: 0, angle: Math.PI },
  RIGHT: { dx: 1, dy: 0, angle: 0 }
};

export class Pacman {
  constructor(maze) {
    this.maze = maze;
    this.tileSize = maze.tileSize;
    this.offsetY = maze.offsetY;
    this.radius = 8;
    this.speed = 2.4;

    this.reset();
  }

  reset() {
    this.x = this.maze.pacmanStart.x * this.tileSize;
    this.y = this.maze.offsetY + this.maze.pacmanStart.y * this.tileSize + this.tileSize / 2;
    this.dir = DIRS.LEFT;
    this.nextDir = DIRS.LEFT;
    this.mouthAngle = 0.2;
    this.mouthSpeed = 0.035;
    this.isDead = false;
  }

  setDirection(dir) {
    this.nextDir = dir;
    // Immediate 180-degree reversal is always allowed
    if (this.dir.dx + dir.dx === 0 && this.dir.dy + dir.dy === 0 && dir !== DIRS.NONE) {
      this.dir = dir;
    }
  }

  getTile() {
    const col = Math.floor(this.x / this.tileSize);
    const row = Math.floor((this.y - this.offsetY) / this.tileSize);
    return { col, row };
  }

  canMove(dir) {
    if (dir === DIRS.NONE) return true;

    // Projected position in 1 full tile step
    const checkDist = this.tileSize * 0.55;
    const checkX = this.x + dir.dx * checkDist;
    const checkY = this.y + dir.dy * checkDist;

    const col = Math.floor(checkX / this.tileSize);
    const row = Math.floor((checkY - this.offsetY) / this.tileSize);

    // Tunnel wrapping allowance on row 9
    if (row === 9 && (col < 0 || col >= this.maze.cols)) {
      return true;
    }

    return !this.maze.isWall(col, row, false);
  }

  update(deltaMs) {
    if (this.isDead) return;

    // Check if buffered turn direction is now valid
    if (this.nextDir !== this.dir) {
      const tile = this.getTile();
      const tileCenterX = tile.col * this.tileSize + this.tileSize / 2;
      const tileCenterY = this.offsetY + tile.row * this.tileSize + this.tileSize / 2;

      // Close to tile center to make a turn
      const distToCenter = Math.hypot(this.x - tileCenterX, this.y - tileCenterY);
      if (distToCenter < 4.0 && this.canMove(this.nextDir)) {
        this.x = tileCenterX;
        this.y = tileCenterY;
        this.dir = this.nextDir;
      }
    }

    // Move forward if path is clear
    if (this.canMove(this.dir)) {
      this.x += this.dir.dx * this.speed;
      this.y += this.dir.dy * this.speed;

      // Animate mouth
      this.mouthAngle += this.mouthSpeed;
      if (this.mouthAngle > 0.35 || this.mouthAngle < 0.03) {
        this.mouthSpeed = -this.mouthSpeed;
      }
    }

    // Tunnel wrapping on row 9
    const totalW = this.maze.cols * this.tileSize;
    if (this.x < -10) {
      this.x = totalW + 8;
    } else if (this.x > totalW + 10) {
      this.x = -8;
    }
  }

  draw(ctx) {
    if (this.isDead) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.dir.angle);

    ctx.fillStyle = '#fda415'; // Amber Pacman matching cabinet palette
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, this.mouthAngle * Math.PI, (2 - this.mouthAngle) * Math.PI);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    // Eye highlight
    ctx.fillStyle = '#1c0a22';
    ctx.beginPath();
    ctx.arc(1, -this.radius / 2, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
