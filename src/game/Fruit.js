// Bonus Arcade Fruit Items

export const FRUIT_TYPES = [
  { name: 'CHERRY', points: 100, color: '#ff334b', stem: '#2ec4b6' },
  { name: 'STRAWBERRY', points: 300, color: '#ff758f', stem: '#00f5d4' },
  { name: 'ORANGE', points: 500, color: '#fda415', stem: '#2ec4b6' }
];

export class Fruit {
  constructor(maze) {
    this.maze = maze;
    this.tileSize = maze.tileSize;
    this.offsetY = maze.offsetY;
    this.x = 13.5 * this.tileSize;
    this.y = this.offsetY + 11 * this.tileSize + this.tileSize / 2;
    this.radius = 7;

    this.active = false;
    this.timer = 0;
    this.currentFruit = FRUIT_TYPES[0];
  }

  spawn(level = 1) {
    const fruitIdx = Math.min(FRUIT_TYPES.length - 1, level - 1);
    this.currentFruit = FRUIT_TYPES[fruitIdx];
    this.active = true;
    this.timer = 10000; // 10s duration
  }

  update(deltaMs) {
    if (!this.active) return;
    this.timer -= deltaMs;
    if (this.timer <= 0) {
      this.active = false;
    }
  }

  checkCollision(pacman) {
    if (!this.active) return null;
    const dist = Math.hypot(this.x - pacman.x, this.y - pacman.y);
    if (dist < this.radius + pacman.radius) {
      this.active = false;
      return this.currentFruit;
    }
    return null;
  }

  draw(ctx) {
    if (!this.active) return;
    ctx.save();
    const px = this.x;
    const py = this.y;

    // Stem
    ctx.strokeStyle = this.currentFruit.stem;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, py - 6);
    ctx.quadraticCurveTo(px + 4, py - 10, px + 6, py - 7);
    ctx.stroke();

    // Body
    ctx.fillStyle = this.currentFruit.color;
    ctx.beginPath();
    ctx.arc(px, py, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Highlight glint
    ctx.fillStyle = '#fff5ea';
    ctx.beginPath();
    ctx.arc(px - 2, py - 2, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
