// Procedural Arcade Maze Soundtrack & Ghost Siren

export class MazeMusic {
  constructor(synth) {
    this.synth = synth;
    this.isPlaying = false;
    this.currentMode = 'menu'; // 'menu' | 'maze' | 'frightened'
    this.step = 0;
    this.bar = 0;
    this.timerId = null;

    this.menuBpm = 112;
    this.mazeBpm = 120;
    this.frightenedBpm = 144;
    this.currentBpm = this.menuBpm;

    // Frequencies (Hz)
    this.freqs = {
      C2: 65.41, D2: 73.42, Eb2: 77.78, F2: 87.31, G2: 98.00, Ab2: 103.83, Bb2: 116.54,
      C3: 130.81, D3: 146.83, Eb3: 155.56, F3: 174.61, G3: 196.00, Ab3: 207.65, Bb3: 233.08,
      C4: 261.63, D4: 293.66, Eb4: 311.13, F4: 349.23, G4: 392.00, Ab4: 415.30, Bb4: 466.16,
      C5: 523.25, D5: 587.33, Eb5: 622.25, G5: 783.99
    };

    // 4-Bar Harmonic Loop: Cm -> Ab -> Fm -> G7
    this.bars = [
      { bass: 'C2', lead: ['C4', 'Eb4', 'G4', 'C5', 'G4', 'Eb4', 'C4', 'Eb4'] },
      { bass: 'Ab2', lead: ['Ab3', 'C4', 'Eb4', 'Ab4', 'Eb4', 'C4', 'Ab3', 'C4'] },
      { bass: 'F2', lead: ['F3', 'Ab3', 'C4', 'F4', 'C4', 'Ab3', 'F3', 'Ab3'] },
      { bass: 'G2', lead: ['G3', 'B3', 'D4', 'G4', 'D4', 'B3', 'G3', 'B3'] }
    ];
  }

  start(mode = 'menu') {
    this.currentMode = mode;
    this.updateBpm();
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.step = 0;
    this.bar = 0;
    this.scheduleTick();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  setMode(mode) {
    this.currentMode = mode;
    this.updateBpm();
    if (!this.isPlaying) {
      this.start(mode);
    }
  }

  updateBpm() {
    if (this.currentMode === 'menu') this.currentBpm = this.menuBpm;
    else if (this.currentMode === 'frightened') this.currentBpm = this.frightenedBpm;
    else this.currentBpm = this.mazeBpm;
  }

  scheduleTick() {
    if (!this.isPlaying) return;

    const stepMs = (60000 / this.currentBpm) / 4;
    this.tick();

    this.step = (this.step + 1) % 16;
    if (this.step === 0) {
      this.bar = (this.bar + 1) % this.bars.length;
    }

    this.timerId = setTimeout(() => this.scheduleTick(), stepMs);
  }

  tick() {
    if (!this.synth.initialized || this.synth.isMuted) return;

    if (this.currentMode === 'frightened') {
      // Rapid siren pulses when ghosts are vulnerable
      if (this.step % 2 === 0) {
        const freq = (this.step % 4 === 0) ? 680 : 540;
        this.synth.playTone({
          freq,
          type: 'square',
          duration: 0.08,
          volume: 0.35,
          bus: 'music'
        });
      }
      return;
    }

    const currentBar = this.bars[this.bar];

    // Track 1: Staccato Bass
    if (this.step % 4 === 0 || this.step % 4 === 2) {
      const baseFreq = this.freqs[currentBar.bass] || 65.41;
      this.synth.playTone({
        freq: baseFreq,
        type: 'sawtooth',
        duration: 0.1,
        volume: this.currentMode === 'maze' ? 0.42 : 0.28,
        bus: 'music'
      });
    }

    // Track 2: 8th Note Arpeggio Lead
    if (this.step % 2 === 0) {
      const noteIdx = Math.floor(this.step / 2) % currentBar.lead.length;
      const noteName = currentBar.lead[noteIdx];
      const freq = this.freqs[noteName];
      if (freq) {
        this.synth.playTone({
          freq,
          type: 'square',
          duration: 0.07,
          volume: this.currentMode === 'maze' ? 0.32 : 0.22,
          bus: 'music'
        });
      }
    }

    // Track 3: Arcade Drum Beat
    if (this.step === 0 || this.step === 8) {
      this.synth.playTone({
        freq: 140,
        type: 'sine',
        duration: 0.07,
        pitchDrop: 110,
        volume: 0.5,
        bus: 'music'
      });
    }

    if (this.step === 4 || this.step === 12) {
      this.synth.playNoise({
        duration: 0.06,
        volume: 0.35,
        filterFreq: 2800,
        filterType: 'bandpass',
        bus: 'music'
      });
    }
  }
}
