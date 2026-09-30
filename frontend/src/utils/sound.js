// Web Audio API based synthesiser for reliable, cross-browser notification sounds
class SoundService {
  constructor() {
    this.audioCtx = null;
    this.muted = localStorage.getItem('canteen_sound_muted') === 'true';
  }

  init() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  isMuted() {
    return this.muted;
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('canteen_sound_muted', this.muted.toString());
    return this.muted;
  }

  playTone(freq, type = 'sine', startTime = 0, duration = 0.2, gainValue = 0.15) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + startTime);

      gain.gain.setValueAtTime(gainValue, this.audioCtx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(this.audioCtx.currentTime + startTime);
      osc.stop(this.audioCtx.currentTime + startTime + duration);
    } catch (e) {
      console.warn('Audio playback not permitted yet:', e);
    }
  }

  // Friendly double chime when order is placed or accepted
  playOrderPlaced() {
    this.playTone(523.25, 'sine', 0, 0.15, 0.2); // C5
    this.playTone(659.25, 'sine', 0.12, 0.25, 0.2); // E5
  }

  // Upbeat celebratory chime when order is Ready for Pickup!
  playOrderReady() {
    this.playTone(523.25, 'triangle', 0, 0.15, 0.25); // C5
    this.playTone(659.25, 'triangle', 0.12, 0.15, 0.25); // E5
    this.playTone(783.99, 'triangle', 0.24, 0.15, 0.25); // G5
    this.playTone(1046.50, 'sine', 0.36, 0.4, 0.3); // C6
  }

  // Play subtle high chime when food is added to cart
  playAddToCart() {
    this.playTone(587.33, 'sine', 0, 0.08, 0.15); // D5
    this.playTone(880.00, 'sine', 0.06, 0.14, 0.15); // A5
  }

  // Play tactile tick when quantity is changed
  playQuantityTick() {
    this.playTone(440, 'triangle', 0, 0.04, 0.08);
  }
}


export const sound = new SoundService();
