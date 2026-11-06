// Main Pixel Maze Arcade Game Controller

import { renderThemedMenu, drawThemedBackdrop } from './MenuFX.js';
import { MazeMap } from './MazeMap.js';
import { Pacman, DIRS } from './Pacman.js';
import { Ghost, GHOST_NAMES, GHOST_STATES } from './Ghost.js';
import { Fruit } from './Fruit.js';

export const GAME_STATES = {
  MENU: 'MENU',
  CONTROLS: 'CONTROLS',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  LEVEL_CLEAR: 'LEVEL_CLEAR',
  GAME_OVER: 'GAME_OVER'
};

export class Game {
  constructor(canvas, synth, sfx, music) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.synth = synth;
    this.sfx = sfx;
    this.music = music;

    this.width = 560;
    this.height = 420;
    this.state = GAME_STATES.MENU;

    // Entities
    this.maze = new MazeMap(20, 38);
    this.pacman = new Pacman(this.maze);
    this.fruit = new Fruit(this.maze);

    // 4 Distinct AI Ghosts
    this.ghosts = [
      new Ghost(GHOST_NAMES.BLINKY, '#ff334b', this.maze, 0),     // Red - Immediate
      new Ghost(GHOST_NAMES.PINKY, '#ff758f', this.maze, 2500),   // Pink - 2.5s delay
      new Ghost(GHOST_NAMES.INKY, '#00f5d4', this.maze, 5500),    // Cyan - 5.5s delay
      new Ghost(GHOST_NAMES.CLYDE, '#fda415', this.maze, 8500)    // Amber - 8.5s delay
    ];

    // Scoring & Lives
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('pixel_maze_hiscore') || '123000', 10);
    this.lives = 5;
    this.maxLives = 5;
    this.level = 1;
    this.ghostCombo = 0; // 200, 400, 800, 1600 pts
    this.dotsEaten = 0;

    // Timing & Juice
    this.shakeIntensity = 0;
    this.shakeDecay = 0.9;
    this.keys = {};

    // Menu Selection
    this.selectedChoice = 'YES';

    this.setupInputs();
  }

  setupInputs() {
    window.addEventListener('keydown', (e) => {
      if (!this.synth.initialized) {
        this.synth.init();
        this.music.start('menu');
      }

      this.keys[e.code] = true;

      if (this.state === GAME_STATES.MENU) {
        if (e.code === 'KeyC') {
          this.sfx.menuConfirm();
          this.state = GAME_STATES.CONTROLS;
        } else {
          this.handleMenuInput(e);
        }
      } else if (this.state === GAME_STATES.CONTROLS) {
        if (e.code === 'Enter' || e.code === 'Escape' || e.code === 'Space' || e.code === 'KeyC') {
          this.sfx.menuConfirm();
          this.state = GAME_STATES.MENU;
        }
      } else if (this.state === GAME_STATES.PLAYING) {
        if (e.code === 'ArrowUp' || e.code === 'KeyW') {
          this.pacman.setDirection(DIRS.UP);
        } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
          this.pacman.setDirection(DIRS.DOWN);
        } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
          this.pacman.setDirection(DIRS.LEFT);
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
          this.pacman.setDirection(DIRS.RIGHT);
        } else if (e.code === 'KeyP' || e.code === 'Escape') {
          this.togglePause();
        }
      } else if (this.state === GAME_STATES.LEVEL_CLEAR) {
        if (e.code === 'Enter' || e.code === 'Space') {
          this.advanceNextLevel();
        }
      } else if (this.state === GAME_STATES.GAME_OVER) {
        if (e.code === 'Enter' || e.code === 'Space') {
          this.sfx.coinInsert();
          this.startGame();
        } else if (e.code === 'Escape') {
          this.state = GAME_STATES.MENU;
          this.music.setMode('menu');
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Touch / Swipe controls for mobile devices
    let touchStartX = 0;
    let touchStartY = 0;
    this.canvas.addEventListener('touchstart', (e) => {
      if (!this.synth.initialized) {
        this.synth.init();
        this.music.start('menu');
      }
      const t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
    }, { passive: true });

    this.canvas.addEventListener('touchend', (e) => {
      if (this.state !== GAME_STATES.PLAYING) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;
      if (Math.hypot(dx, dy) < 20) return;

      if (Math.abs(dx) > Math.abs(dy)) {
        this.pacman.setDirection(dx > 0 ? DIRS.RIGHT : DIRS.LEFT);
      } else {
        this.pacman.setDirection(dy > 0 ? DIRS.DOWN : DIRS.UP);
      }
    }, { passive: true });
  }

  handleMenuInput(e) {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      if (this.selectedChoice !== 'YES') {
        this.selectedChoice = 'YES';
        this.sfx.menuMove();
      }
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      if (this.selectedChoice !== 'NO') {
        this.selectedChoice = 'NO';
        this.sfx.menuMove();
      }
    } else if (e.code === 'Enter' || e.code === 'Space') {
      if (this.selectedChoice === 'YES') {
        this.sfx.menuConfirm();
        this.startGame();
      }
    }
  }

  startGame() {
    this.state = GAME_STATES.PLAYING;
    this.score = 0;
    this.lives = this.maxLives;
    this.level = 1;
    this.dotsEaten = 0;
    this.ghostCombo = 0;

    this.maze.init();
    this.pacman.reset();
    this.ghosts.forEach(g => g.reset());
    this.fruit.active = false;

    this.music.setMode('maze');
  }

  advanceNextLevel() {
    this.level++;
    this.dotsEaten = 0;
    this.ghostCombo = 0;

    this.maze.init();
    this.pacman.reset();
    this.ghosts.forEach(g => {
      g.reset();
      g.speed = Math.min(3.0, 2.1 + (this.level * 0.15));
    });
    this.fruit.active = false;

    this.state = GAME_STATES.PLAYING;
    this.music.setMode('maze');
  }

  togglePause() {
    if (this.state === GAME_STATES.PLAYING) {
      this.state = GAME_STATES.PAUSED;
      this.music.stop();
    } else if (this.state === GAME_STATES.PAUSED) {
      this.state = GAME_STATES.PLAYING;
      this.music.start('maze');
    }
  }

  triggerScreenShake(intensity = 6) {
    this.shakeIntensity = intensity;
  }

  update(timestamp) {
    const deltaMs = 16.6;

    if (this.shakeIntensity > 0.05) {
      this.shakeIntensity *= this.shakeDecay;
    } else {
      this.shakeIntensity = 0;
    }

    if (this.state !== GAME_STATES.PLAYING) return;

    // 1. Pacman update
    this.pacman.update(deltaMs);

    // 2. Dot and Energizer consumption
    const pTile = this.pacman.getTile();
    const dotResult = this.maze.eatDot(pTile.col, pTile.row);
    if (dotResult) {
      this.score += dotResult.points;
      this.dotsEaten++;

      if (dotResult.type === 'dot') {
        this.sfx.waka();
      } else if (dotResult.type === 'energizer') {
        this.sfx.energizer();
        this.ghostCombo = 0;
        const frightenedMs = Math.max(4000, 8500 - (this.level * 600));
        this.ghosts.forEach(g => g.setFrightened(frightenedMs));
        this.music.setMode('frightened');
      }

      // Fruit spawn milestones (at 70 and 140 dots)
      if (this.dotsEaten === 70 || this.dotsEaten === 140) {
        this.fruit.spawn(this.level);
      }

      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('pixel_maze_hiscore', this.highScore.toString());
      }
    }

    // 3. Fruit update & collision
    this.fruit.update(deltaMs);
    const fruitEaten = this.fruit.checkCollision(this.pacman);
    if (fruitEaten) {
      this.score += fruitEaten.points;
      this.sfx.eatFruit();
    }

    // 4. Ghost AI update & collisions
    const blinky = this.ghosts.find(g => g.name === GHOST_NAMES.BLINKY);
    let anyFrightened = false;

    for (const ghost of this.ghosts) {
      ghost.update(deltaMs, this.pacman, blinky);

      if (ghost.state === GHOST_STATES.FRIGHTENED) {
        anyFrightened = true;
      }

      // Check collision with Pacman
      const dist = Math.hypot(this.pacman.x - ghost.x, this.pacman.y - ghost.y);
      if (dist < this.pacman.radius + ghost.radius - 2) {
        if (ghost.state === GHOST_STATES.FRIGHTENED) {
          // Eat Ghost!
          ghost.state = GHOST_STATES.EATEN;
          this.ghostCombo++;
          const comboPts = Math.min(1600, 200 * Math.pow(2, this.ghostCombo - 1));
          this.score += comboPts;
          this.sfx.eatGhost();
          this.triggerScreenShake(4);
        } else if (ghost.state === GHOST_STATES.NORMAL) {
          // Pacman caught by ghost
          this.handlePlayerDeath();
          return;
        }
      }
    }

    // Restore normal music when no ghosts are frightened
    if (!anyFrightened && this.music.currentMode === 'frightened') {
      this.music.setMode('maze');
    }

    // 5. Stage cleared check
    if (this.maze.dotsRemaining === 0) {
      this.handleLevelClear();
    }
  }

  handlePlayerDeath() {
    this.lives--;
    this.sfx.death();
    this.triggerScreenShake(10);

    if (this.lives > 0) {
      this.pacman.reset();
      this.ghosts.forEach(g => g.reset());
      this.music.setMode('maze');
    } else {
      this.triggerGameOver();
    }
  }

  handleLevelClear() {
    this.score += 1500;
    this.state = GAME_STATES.LEVEL_CLEAR;
    this.music.stop();
    this.sfx.levelCleared();
  }

  triggerGameOver() {
    this.state = GAME_STATES.GAME_OVER;
    this.music.stop();
    this.sfx.gameOver();
  }

  render() {
    const { ctx } = this;
    ctx.save();

    // Themed animated backdrop (shared with the title screen)
    drawThemedBackdrop(ctx, 'maze', this.width, this.height);

    if (this.shakeIntensity > 0) {
      const sx = (Math.random() - 0.5) * this.shakeIntensity * 2;
      const sy = (Math.random() - 0.5) * this.shakeIntensity * 2;
      ctx.translate(sx, sy);
    }

    if (this.state === GAME_STATES.MENU) {
      this.renderMenu();
    } else if (this.state === GAME_STATES.CONTROLS) {
      this.renderControls();
    } else {
      // Gameplay Rendering
      const now = performance.now();
      this.maze.draw(ctx, now);
      this.fruit.draw(ctx);
      this.pacman.draw(ctx);
      for (const g of this.ghosts) g.draw(ctx, now);
      this.renderHUD();

      if (this.state === GAME_STATES.PAUSED) {
        this.renderPauseOverlay();
      } else if (this.state === GAME_STATES.LEVEL_CLEAR) {
        this.renderLevelClearOverlay();
      } else if (this.state === GAME_STATES.GAME_OVER) {
        this.renderGameOver();
      }
    }

    ctx.restore();
  }

  drawPixelHearts(startX, startY, count) {
    const { ctx } = this;
    const spacing = 28;

    for (let i = 0; i < this.maxLives; i++) {
      const x = startX + i * spacing;
      const y = startY;

      if (i < count) {
        // Active Amber Heart
        ctx.fillStyle = '#fda415';
        ctx.fillRect(x + 2, y, 4, 3);
        ctx.fillRect(x + 8, y, 4, 3);
        ctx.fillRect(x, y + 3, 14, 5);
        ctx.fillRect(x + 2, y + 8, 10, 3);
        ctx.fillRect(x + 4, y + 11, 6, 2);
        ctx.fillRect(x + 6, y + 13, 2, 2);

        // Core Glint
        ctx.fillStyle = '#fff5ea';
        ctx.fillRect(x + 3, y + 2, 2, 2);
      } else {
        // Empty Heart Outline
        ctx.fillStyle = 'rgba(90, 50, 100, 0.4)';
        ctx.fillRect(x, y, 14, 14);
      }
    }
  }

  renderMenu() {
    // Themed animated title screen (backdrop, wave title, attract-mode scene)
    renderThemedMenu(this.ctx, {
      id: 'maze',
      width: this.canvas.width,
      height: this.canvas.height,
      highScore: this.highScore,
      choice: this.selectedChoice
    });
  }

  renderControls() {
    const { ctx, width } = this;
    drawThemedBackdrop(ctx, 'maze', this.canvas.width, this.canvas.height);
    ctx.fillStyle = 'rgba(8, 3, 14, 0.55)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.save();
    ctx.textAlign = 'center';
    const cx = width / 2;

    ctx.font = '18px "Press Start 2P", monospace';
    ctx.fillStyle = '#fda415';
    ctx.fillText('★ HOW TO PLAY ★', cx, 55);

    // Box
    ctx.fillStyle = 'rgba(25, 12, 30, 0.75)';
    ctx.fillRect(40, 75, width - 80, 265);
    ctx.strokeStyle = '#fda415';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 75, width - 80, 265);

    ctx.font = '10px "Press Start 2P", monospace';
    const lines = [
      { k: 'ARROWS / [W, A, S, D]', d: 'NAVIGATE MAZE' },
      { k: 'SWIPE / TOUCH', d: 'MOBILE SWIPE TURNS' },
      { k: '[P] / [ESC]', d: 'PAUSE GAME' },
      { k: 'DOTS (•)', d: '+10 PTS' },
      { k: 'ENERGIZERS (O)', d: '+50 PTS / CHASE GHOSTS' },
      { k: 'EATEN GHOSTS', d: '+200, 400, 800, 1600' },
      { k: 'WARP TUNNELS', d: 'WRAP SCREEN HORIZONTALLY' }
    ];

    let y = 110;
    lines.forEach(item => {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#fda415';
      ctx.fillText(item.k, 60, y);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff5ea';
      ctx.fillText(item.d, width - 60, y);
      y += 29;
    });

    ctx.textAlign = 'center';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = '#fff5ea';
    ctx.fillText('PRESS [ENTER] OR [ESC] TO RETURN', cx, 375);

    ctx.restore();
  }

  renderHUD() {
    const { ctx } = this;
    ctx.save();

    // Top-Left: SCORE & LEVEL
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillStyle = '#fff5ea';
    ctx.fillText('SCORE', 34, 25);

    ctx.fillStyle = '#fda415';
    ctx.fillText(this.score.toString().padStart(6, '0'), 95, 25);

    ctx.fillStyle = '#00f5d4';
    ctx.fillText(`LVL ${this.level}`, 180, 25);

    // Top-Right: 5 Hearts
    this.drawPixelHearts(380, 14, this.lives);

    ctx.restore();
  }

  renderPauseOverlay() {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = 'rgba(30, 14, 38, 0.8)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.textAlign = 'center';
    ctx.font = '24px "Press Start 2P", monospace';
    ctx.fillStyle = '#fda415';
    ctx.fillText('PAUSED', this.width / 2, this.height / 2);

    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillStyle = '#fff5ea';
    ctx.fillText('PRESS [P] OR [ESC] TO RESUME', this.width / 2, this.height / 2 + 36);
    ctx.restore();
  }

  renderLevelClearOverlay() {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = 'rgba(30, 14, 38, 0.85)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.textAlign = 'center';
    ctx.font = '24px "Press Start 2P", monospace';
    ctx.fillStyle = '#00f5d4';
    ctx.fillText('MAZE CLEARED!', this.width / 2, 180);

    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillStyle = '#fda415';
    ctx.fillText('+1500 BONUS POINTS', this.width / 2, 220);

    ctx.fillStyle = '#fff5ea';
    ctx.fillText('PRESS [SPACE] FOR NEXT STAGE', this.width / 2, 270);
    ctx.restore();
  }

  renderGameOver() {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = 'rgba(30, 14, 38, 0.88)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.textAlign = 'center';
    ctx.font = '26px "Press Start 2P", monospace';
    ctx.fillStyle = '#ff334b';
    ctx.fillText('GAME OVER', this.width / 2, 170);

    ctx.font = '13px "Press Start 2P", monospace';
    ctx.fillStyle = '#fff5ea';
    ctx.fillText(`FINAL SCORE: ${this.score}`, this.width / 2, 215);

    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillStyle = '#fda415';
    ctx.fillText('PRESS [ENTER] TO REPLAY', this.width / 2, 280);

    ctx.fillStyle = '#b39ebd';
    ctx.fillText('PRESS [ESC] FOR MAIN MENU', this.width / 2, 310);
    ctx.restore();
  }
}
