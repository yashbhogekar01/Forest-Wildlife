// Web Audio API Industrial Emergency Buzzer Sound Generator for Village Perimeter Warnings

class BuzzerSound {
  constructor() {
    this.audioCtx = null;
    this.intervalId = null;
    this.isAudioMuted = false;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
  }

  playBuzzerPulse() {
    if (this.isAudioMuted) return;
    this.init();
    if (!this.audioCtx) return;

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    try {
      const now = this.audioCtx.currentTime;

      // Create a rapid triple-buzz sequence (BZZZ - BZZZ - BZZZ)
      const buzzTimes = [0, 0.18, 0.36];

      buzzTimes.forEach(offset => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        // Harsh electronic square wave for authentic warning buzzer sound
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, now + offset); // 220Hz industrial warning tone
        osc.frequency.setValueAtTime(190, now + offset + 0.06); // pitch dip for buzzer buzz

        gain.gain.setValueAtTime(0.3, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.12);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.12);
      });

    } catch (e) {
      console.warn('Buzzer playback error:', e);
    }
  }

  // Alias for backward compatibility with previous siren alert calls
  playSirenPulse() {
    this.playBuzzerPulse();
  }

  startLoop() {
    if (this.intervalId) return;
    this.playBuzzerPulse();
    this.intervalId = setInterval(() => {
      this.playBuzzerPulse();
    }, 900);
  }

  stopLoop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  toggleMute() {
    this.isAudioMuted = !this.isAudioMuted;
    if (this.isAudioMuted) {
      this.stopLoop();
    } else {
      this.startLoop();
    }
    return this.isAudioMuted;
  }
}

export const sirenPlayer = new BuzzerSound();
