// Audio system for the space game

export class AudioSystem {
  constructor() {
    this.audioContext = null;
    this.engineOscillator = null;
    this.engineGain = null;
    this.enabled = true;
  }

  init() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      this.audioContext = new AudioContext();
    }

    // Load preference
    const saved = localStorage.getItem('spaceGameSound');
    this.enabled = saved !== 'off';
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('spaceGameSound', this.enabled ? 'on' : 'off');
    return this.enabled;
  }

  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Engine hum disabled - was annoying
  startEngine() {
    // Disabled
  }

  stopEngine() {
    // Disabled
  }

  playCloseCall() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(880, this.audioContext.currentTime);
    osc.frequency.setValueAtTime(1320, this.audioContext.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.15);
  }

  playGameOver() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(55, this.audioContext.currentTime + 0.8);

    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.8);
  }

  playLevelUp() {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    // Ascending arpeggio - C major chord
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const duration = 0.1;

    notes.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);

      const start = this.audioContext.currentTime + i * duration;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start(start);
      osc.stop(start + duration + 0.05);
    });
  }

  cleanup() {
    this.stopEngine();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
