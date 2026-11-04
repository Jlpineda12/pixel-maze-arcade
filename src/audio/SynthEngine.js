// Pure Web Audio API Sound Synthesizer (Zero External Audio Assets)

export class SynthEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.initialized = false;
    this.isMuted = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // SFX Bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Music Bus
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone({ freq, type = 'square', duration = 0.1, volume = 0.5, pitchDrop = 0, pitchRise = 0, bus = 'sfx' }) {
    if (!this.initialized || this.isMuted) return;
    this.resume();

    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);

    if (pitchDrop > 0) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq - pitchDrop), t0 + duration);
    } else if (pitchRise > 0) {
      osc.frequency.exponentialRampToValueAtTime(freq + pitchRise, t0 + duration);
    }

    gain.gain.setValueAtTime(volume, t0);
    gain.gain.linearRampToValueAtTime(0.001, t0 + duration);

    const targetBus = bus === 'music' ? this.musicGain : this.sfxGain;
    osc.connect(gain);
    gain.connect(targetBus);

    osc.start(t0);
    osc.stop(t0 + duration);
  }

  playNoise({ duration = 0.1, volume = 0.4, filterFreq = 1200, filterType = 'lowpass', bus = 'sfx' }) {
    if (!this.initialized || this.isMuted) return;
    this.resume();

    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    if (bufferSize <= 0) return;

    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2) - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    const t0 = this.ctx.currentTime;
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

    const targetBus = bus === 'music' ? this.musicGain : this.sfxGain;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(targetBus);

    noise.start(t0);
    noise.stop(t0 + duration);
  }
}
