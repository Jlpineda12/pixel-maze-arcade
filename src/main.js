// Application Entry Point for PIXEL MAZE
import { SynthEngine } from './audio/SynthEngine.js';
import { SoundEffects } from './audio/SoundEffects.js';
import { MazeMusic } from './audio/MazeMusic.js';
import { Game } from './game/Game.js';
import { RetroShell } from './shell/RetroShell.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const synth = new SynthEngine();
  const sfx = new SoundEffects(synth);
  const music = new MazeMusic(synth);
  const game = new Game(canvas, synth, sfx, music);

  // Audio can only start after a user gesture (browser autoplay policy)
  const startAudio = () => {
    if (!synth.initialized) {
      synth.init();
      music.start('menu');
    } else {
      synth.resume();
    }
  };

  // Presentation layer: synthwave room, neon marquee, CRT, boot sequence,
  // touch gamepad on phones and the terminal status bar.
  new RetroShell({
    id: 'maze',
    title: 'PIXEL MAZE',
    year: '1980',
    accent: '#fee440',
    accent2: '#3c4bd6',
    joystickColor: '#fee440',
    repo: 'https://github.com/Jlpineda12/pixel-maze-arcade',
    buttons: { A: { code: 'Enter', alt: ['Space'], label: 'START' }, B: { code: 'KeyP', alt: ['Escape'], label: 'PAUSE' } },
    ticker: ["COME TODOS LOS PUNTOS", "ENERGIZER = CAZA FANTASMAS", "200 · 400 · 800 · 1600", "USA LOS TÚNELES", "4 FANTASMAS · 4 PERSONALIDADES"],
    onFirstInput: startAudio
  }).init();

  window.addEventListener('click', startAudio, { once: true });
  window.addEventListener('keydown', startAudio, { once: true });

  // Main 60 FPS loop
  function loop(timestamp) {
    game.update(timestamp);
    game.render();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
});
