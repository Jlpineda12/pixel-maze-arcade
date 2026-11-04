// Procedural Retro Sound Effects for Pixel Maze Arcade

export class SoundEffects {
  constructor(synth) {
    this.synth = synth;
    this.wakaAlt = false;
  }

  coinInsert() {
    this.synth.playTone({
      freq: 987.77,
      type: 'square',
      duration: 0.08,
      volume: 0.6,
      bus: 'sfx'
    });
    setTimeout(() => {
      this.synth.playTone({
        freq: 1318.51,
        type: 'square',
        duration: 0.25,
        volume: 0.7,
        bus: 'sfx'
      });
    }, 75);
  }

  menuMove() {
    this.synth.playTone({
      freq: 493.88,
      type: 'square',
      duration: 0.04,
      volume: 0.35,
      bus: 'sfx'
    });
  }

  menuConfirm() {
    this.synth.playTone({
      freq: 587.33,
      type: 'square',
      duration: 0.06,
      volume: 0.5,
      bus: 'sfx'
    });
    setTimeout(() => {
      this.synth.playTone({
        freq: 880.00,
        type: 'square',
        duration: 0.12,
        volume: 0.6,
        bus: 'sfx'
      });
    }, 60);
  }

  // Waka-Waka Munching sound (alternating frequencies)
  waka() {
    this.wakaAlt = !this.wakaAlt;
    const freq = this.wakaAlt ? 440 : 330;
    this.synth.playTone({
      freq,
      type: 'triangle',
      duration: 0.07,
      pitchDrop: 60,
      volume: 0.45
    });
  }

  // Large Power Energizer consumed
  energizer() {
    this.synth.playTone({
      freq: 260,
      type: 'square',
      duration: 0.18,
      pitchRise: 280,
      volume: 0.6
    });
  }

  // Ghost Eaten during frightened mode
  eatGhost() {
    const notes = [330, 440, 660, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.synth.playTone({
          freq,
          type: 'square',
          duration: 0.06,
          volume: 0.6
        });
      }, idx * 40);
    });
  }

  // Bonus Fruit consumed
  eatFruit() {
    this.synth.playTone({
      freq: 784,
      type: 'square',
      duration: 0.08,
      volume: 0.5
    });
    setTimeout(() => {
      this.synth.playTone({
        freq: 1046.5,
        type: 'square',
        duration: 0.15,
        volume: 0.65
      });
    }, 70);
  }

  // Pac-Man Death Spiral
  death() {
    const steps = [
      620, 580, 540, 500, 460, 420, 380, 340, 300, 260, 220, 180, 140
    ];
    steps.forEach((freq, idx) => {
      setTimeout(() => {
        this.synth.playTone({
          freq,
          type: 'triangle',
          duration: 0.05,
          pitchDrop: 30,
          volume: 0.55
        });
      }, idx * 45);
    });

    setTimeout(() => {
      this.synth.playNoise({
        duration: 0.2,
        volume: 0.5,
        filterFreq: 800,
        filterType: 'lowpass'
      });
    }, steps.length * 45);
  }

  // Stage clear victory melody
  levelCleared() {
    const fanfare = [
      { f: 523.25, d: 0.1 },
      { f: 659.25, d: 0.1 },
      { f: 783.99, d: 0.1 },
      { f: 1046.50, d: 0.3 }
    ];
    fanfare.forEach((n, idx) => {
      setTimeout(() => {
        this.synth.playTone({
          freq: n.f,
          type: 'square',
          duration: n.d,
          volume: 0.6
        });
      }, idx * 110);
    });
  }

  // Game over sound
  gameOver() {
    const notes = [349.23, 329.63, 293.66, 261.63];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.synth.playTone({
          freq,
          type: 'triangle',
          duration: 0.22,
          volume: 0.6
        });
      }, idx * 180);
    });
  }
}
