/**
 * Romantic Audio Engine & Music Controller
 * Supports HTML5 MP3/Audio file playback with automatic fallback
 * to Web Audio API romantic harp/piano synthesis.
 */

import { MUSIC_CONFIG } from '../config/musicConfig.js';

class RomanticAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.timer = null;
    this.currentStep = 0;
    this.volumeNode = null;
    this.audioElement = null;
    this.listeners = new Set();
    this.hasUserInteracted = false;
    this.isUsingSynthesizer = false;

    // Load initial settings (fallback to MUSIC_CONFIG)
    let initialUrl = MUSIC_CONFIG.url || '/assets/musica.mp3';
    let initialVol = MUSIC_CONFIG.volume || 0.65;
    try {
      const saved = localStorage.getItem('boda_music_config_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.url && !parsed.url.startsWith('data:')) {
          initialUrl = parsed.url;
        } else {
          initialUrl = '/assets/musica.mp3';
          // Clean up corrupted storage
          parsed.url = '/assets/musica.mp3';
          localStorage.setItem('boda_music_config_v1', JSON.stringify(parsed));
        }
        if (parsed.volume !== undefined) initialVol = parsed.volume;
      }
    } catch (e) {}

    this.currentUrl = initialUrl;
    this.currentVolume = initialVol;
    this.previousVolume = initialVol;
    this.isMuted = false;

    // Romantic Canon in D progression frequencies (Hz)
    this.chords = [
      [293.66, 369.99, 440.00, 587.33], // D Major
      [277.18, 329.63, 440.00, 554.37], // A Major
      [246.94, 293.66, 369.99, 493.88], // B minor
      [220.00, 277.18, 369.99, 440.00], // F# minor
      [196.00, 246.94, 293.66, 392.00], // G Major
      [293.66, 369.99, 440.00, 587.33], // D Major
      [196.00, 246.94, 293.66, 392.00], // G Major
      [220.00, 277.18, 329.63, 440.00]  // A Major
    ];

    this.initAudioElement();
  }

  initAudioElement() {
    if (typeof window === 'undefined') return;
    try {
      this.audioElement = new Audio();
      this.audioElement.src = this.currentUrl;
      this.audioElement.loop = true; // REPRODUCCIÓN EN BUCLE PERPETUO
      this.audioElement.volume = this.currentVolume;
      this.audioElement.preload = 'auto';

      this.audioElement.addEventListener('play', () => {
        this.isPlaying = true;
        this.isUsingSynthesizer = false;
        this.notifyChange();
      });

      this.audioElement.addEventListener('pause', () => {
        if (!this.isUsingSynthesizer) {
          this.isPlaying = false;
          this.notifyChange();
        }
      });

      this.audioElement.addEventListener('ended', () => {
        // En caso de que algún navegador móvil suspenda el loop nativo
        if (this.isPlaying && this.audioElement) {
          this.audioElement.currentTime = 0;
          this.audioElement.play().catch(() => {});
        }
      });

      this.audioElement.addEventListener('error', () => {
        // Fallback to synthesizer if MP3 fails to load or 404
        if (this.isPlaying) {
          this.isUsingSynthesizer = true;
          this.startMelody();
        }
      });
    } catch (err) {
      console.warn('[AudioEngine] HTML5 Audio init error:', err);
    }
  }

  onStateChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyChange() {
    const state = {
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      volume: this.currentVolume,
      url: this.currentUrl
    };
    this.listeners.forEach(cb => {
      try { cb(this.isPlaying, state); } catch(e) {}
    });
  }

  setVolume(vol) {
    const val = Math.max(0, Math.min(1, parseFloat(vol)));
    this.currentVolume = val;
    if (val > 0) {
      this.isMuted = false;
      this.previousVolume = val;
    }

    if (this.audioElement) {
      this.audioElement.volume = val;
      this.audioElement.muted = this.isMuted;
    }
    if (this.volumeNode && this.ctx) {
      this.volumeNode.gain.setValueAtTime(val * 0.22, this.ctx.currentTime);
    }

    // Persist to storage
    try {
      const saved = localStorage.getItem('boda_music_config_v1');
      const obj = saved ? JSON.parse(saved) : {};
      obj.volume = val;
      localStorage.setItem('boda_music_config_v1', JSON.stringify(obj));
    } catch (e) {}

    this.notifyChange();
  }

  getVolume() {
    return this.currentVolume;
  }

  toggleMute() {
    if (this.isMuted) {
      this.isMuted = false;
      const restoreVol = this.previousVolume > 0 ? this.previousVolume : 0.65;
      this.setVolume(restoreVol);
    } else {
      this.previousVolume = this.currentVolume > 0 ? this.currentVolume : 0.65;
      this.isMuted = true;
      if (this.audioElement) {
        this.audioElement.muted = true;
      }
      if (this.volumeNode && this.ctx) {
        this.volumeNode.gain.setValueAtTime(0, this.ctx.currentTime);
      }
      this.notifyChange();
    }
    return this.isMuted;
  }

  setAudioSource(newUrl) {
    if (!newUrl) return;
    this.currentUrl = newUrl;
    if (this.audioElement) {
      const wasPlaying = this.isPlaying;
      this.audioElement.src = newUrl;
      this.audioElement.loop = true;
      if (wasPlaying) {
        this.audioElement.play().catch(e => console.warn(e));
      }
    }
    try {
      const saved = localStorage.getItem('boda_music_config_v1');
      const obj = saved ? JSON.parse(saved) : {};
      if (!newUrl.startsWith('data:')) {
        obj.url = newUrl;
        localStorage.setItem('boda_music_config_v1', JSON.stringify(obj));
      }
    } catch (e) {}

    this.notifyChange();
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.volumeNode = this.ctx.createGain();
      this.volumeNode.gain.setValueAtTime(0.18, this.ctx.currentTime);
      this.volumeNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPianoNote(freq, startTime, duration = 2.2) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.22, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.volumeNode);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }

  startMelody() {
    this.initContext();
    this.isUsingSynthesizer = true;
    this.isPlaying = true;
    this.currentStep = 0;
    this.notifyChange();

    const playNextBar = () => {
      if (!this.isPlaying || !this.isUsingSynthesizer) return;
      const now = this.ctx.currentTime;
      const chordIndex = this.currentStep % this.chords.length;
      const notes = this.chords[chordIndex];

      notes.forEach((freq, idx) => {
        this.playPianoNote(freq, now + idx * 0.45, 2.5);
      });

      const bassFreq = notes[0] / 2;
      this.playPianoNote(bassFreq, now, 3.2);

      this.currentStep++;
      this.timer = setTimeout(playNextBar, 2000);
    };

    playNextBar();
  }

  stopMelody() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  async play() {
    if (this.isPlaying) return true;

    // 1. Try playing HTML5 audio (MP3 / configured URL)
    if (this.audioElement) {
      try {
        const targetSrc = this.currentUrl || MUSIC_CONFIG.url || '/assets/musica.mp3';
        if (this.audioElement.src !== new URL(targetSrc, window.location.href).href) {
          this.audioElement.src = targetSrc;
        }
        await this.audioElement.play();
        this.isPlaying = true;
        this.isUsingSynthesizer = false;
        this.notifyChange();
        return true;
      } catch (err) {
        if (err.name === 'NotAllowedError') {
          // Autoplay blocked by browser policy: arm gesture listener
          this.armAutoplayOnFirstGesture();
          return false;
        }
        // File not found or network error: fallback to synthesizer
        this.startMelody();
        return true;
      }
    }

    // 2. Fallback to synthesizer
    this.startMelody();
    return true;
  }

  pause() {
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
    }
    this.stopMelody();
    this.isPlaying = false;
    this.isUsingSynthesizer = false;
    this.notifyChange();
  }

  toggleMusic() {
    if (this.isPlaying) {
      this.pause();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  armAutoplayOnFirstGesture() {
    if (this.hasUserInteracted) return;

    const triggerPlay = () => {
      if (this.hasUserInteracted) return;
      this.hasUserInteracted = true;

      ['click', 'touchstart', 'scroll', 'keydown', 'pointerdown', 'wheel'].forEach(ev => {
        window.removeEventListener(ev, triggerPlay, { passive: true });
      });

      if (!this.isPlaying) {
        this.play().catch(() => {});
      }
    };

    ['click', 'touchstart', 'scroll', 'keydown', 'pointerdown', 'wheel'].forEach(ev => {
      window.addEventListener(ev, triggerPlay, { once: true, passive: true });
    });
  }

  startAutoplayIfConfigured() {
    if (!MUSIC_CONFIG.autoplay) return;

    this.play().then(started => {
      if (!started) {
        this.armAutoplayOnFirstGesture();
      }
    }).catch(() => {
      this.armAutoplayOnFirstGesture();
    });
  }

  // Sound Effect: Wax Seal Opening Pop
  playWaxBreakSound() {
    this.initContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.18);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);

    setTimeout(() => {
      this.playPianoNote(880, this.ctx.currentTime, 1.2);
      this.playPianoNote(1174.66, this.ctx.currentTime + 0.1, 1.4);
    }, 120);
  }

  // Sound Effect: Check-in / RSVP Success Chime
  playSuccessChime() {
    this.initContext();
    const now = this.ctx.currentTime;
    this.playPianoNote(659.25, now, 1.5);
    this.playPianoNote(880.00, now + 0.15, 2.0);
    this.playPianoNote(1318.51, now + 0.3, 2.2);
  }

  // Sound Effect: Warning / Error Beep
  playWarningBeep() {
    this.initContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.setValueAtTime(180, now + 0.15);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }
}

export const audioEngine = new RomanticAudioEngine();
