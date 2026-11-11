/**
 * Toast Notifications & Romantic Audio Engine — Carlos & Jackie Wedding (MVP PHP)
 */

(function () {
  // 1. Toast Utility
  let toastContainer = null;

  function getToastContainer() {
    if (!toastContainer || !document.body.contains(toastContainer)) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
    return toastContainer;
  }

  window.showToast = function (message, type = 'info', duration = 3500) {
    const toastMount = getToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const iconMap = {
      success: '✨',
      error: '⚠️',
      warning: '🔔',
      info: '💍'
    };

    toast.innerHTML = `
      <span class="toast-icon" style="font-size: 1.2rem;">${iconMap[type] || '💍'}</span>
      <span class="toast-text" style="flex: 1; line-height: 1.4;">${message}</span>
    `;

    toastMount.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => {
        if (toast.parentElement) {
          toast.parentElement.removeChild(toast);
        }
      }, 400);
    }, duration);
  };

  // 2. Romantic Audio Engine (HTML5 MP3 Loop + Web Audio Synthesizer Fallback)
  const musicCfg = (window.WEDDING_CONFIG && window.WEDDING_CONFIG.music) || {
    url: 'assets/musica.mp3',
    autoplay: true,
    volume: 0.65,
    labelPlay: '¡Dale play!',
    labelPause: 'Pausar música'
  };

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
      this.gestureArmed = false;
      this.playPending = false;

      let initialUrl = musicCfg.url || 'assets/musica.mp3';
      let initialVol = musicCfg.volume !== undefined ? musicCfg.volume : 0.65;

      try {
        const saved = localStorage.getItem('boda_music_config_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.volume !== undefined && parsed.volume > 0) initialVol = parsed.volume;
        }
      } catch (e) {}

      this.currentUrl = initialUrl;
      this.currentVolume = initialVol;
      this.previousVolume = initialVol;
      this.isMuted = false;

      // Romantic Canon in D progression frequencies (Hz) fallback
      this.chords = [
        [293.66, 369.99, 440.00, 587.33],
        [277.18, 329.63, 440.00, 554.37],
        [246.94, 293.66, 369.99, 493.88],
        [220.00, 277.18, 369.99, 440.00],
        [196.00, 246.94, 293.66, 392.00],
        [293.66, 369.99, 440.00, 587.33],
        [196.00, 246.94, 293.66, 392.00],
        [220.00, 277.18, 329.63, 440.00]
      ];

      this.initAudioElement();
    }

    initAudioElement() {
      if (typeof window === 'undefined') return;
      try {
        let audio = document.getElementById('wedding-audio-element');
        if (!audio) {
          audio = document.createElement('audio');
          audio.id = 'wedding-audio-element';
          audio.style.display = 'none';
          const mount = document.getElementById('audio-engine-mount') || document.body;
          mount.appendChild(audio);
        }
        this.audioElement = audio;
        this.audioElement.src = this.currentUrl;
        this.audioElement.loop = true;
        this.audioElement.volume = this.currentVolume;
        this.audioElement.preload = 'auto';
        this.audioElement.setAttribute('playsinline', '');
        this.audioElement.setAttribute('webkit-playsinline', '');

        // IMPORTANTE: Usar 'playing' (no 'play') para confirmar que el navegador realmente permitió el audio
        this.audioElement.addEventListener('playing', () => {
          this.isPlaying = true;
          this.isUsingSynthesizer = false;
          this.removeUnlockPrompt();
          this.notifyChange();
        });

        this.audioElement.addEventListener('pause', () => {
          if (!this.isUsingSynthesizer) {
            this.isPlaying = false;
            this.notifyChange();
          }
        });

        this.audioElement.addEventListener('ended', () => {
          if (this.isPlaying && this.audioElement) {
            this.audioElement.currentTime = 0;
            this.audioElement.play().catch(() => {});
          }
        });

        this.audioElement.addEventListener('error', () => {
          if (this.isPlaying) {
            this.isUsingSynthesizer = true;
            this.startMelody();
          }
        });
      } catch (err) {
        console.warn('[AudioEngine] HTML5 Audio init error:', err);
      }
    }

    isReallyPlaying() {
      if (this.isUsingSynthesizer && this.isPlaying) return true;
      return Boolean(this.isPlaying && this.audioElement && !this.audioElement.paused && !this.audioElement.ended);
    }

    onStateChange(callback) {
      this.listeners.add(callback);
      return () => this.listeners.delete(callback);
    }

    notifyChange() {
      const playing = this.isReallyPlaying();
      const state = {
        isPlaying: playing,
        isMuted: this.isMuted,
        volume: this.currentVolume,
        url: this.currentUrl
      };
      this.listeners.forEach(cb => {
        try { cb(playing, state); } catch (e) {}
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

      try {
        localStorage.setItem('boda_music_config_v1', JSON.stringify({ volume: val }));
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
      if (this.isReallyPlaying()) {
        return true;
      }
      if (this.playPending) {
        return false;
      }

      if (this.audioElement) {
        this.playPending = true;
        try {
          this.audioElement.muted = this.isMuted;
          this.audioElement.volume = this.currentVolume;
          await this.audioElement.play();
          this.playPending = false;
          this.isPlaying = true;
          this.isUsingSynthesizer = false;
          this.removeUnlockPrompt();
          this.notifyChange();
          return true;
        } catch (err) {
          this.playPending = false;
          this.isPlaying = false;
          this.notifyChange();

          if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
            this.armAutoplayOnFirstGesture();
            return false;
          }
          this.startMelody();
          return true;
        }
      }

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
      if (this.isReallyPlaying()) {
        this.pause();
        return false;
      } else {
        this.play();
        return true;
      }
    }

    showUnlockPrompt() {
      if (this.isReallyPlaying()) return;
      if (document.getElementById('audio-unlock-pill')) return;

      const pill = document.createElement('button');
      pill.id = 'audio-unlock-pill';
      pill.type = 'button';
      pill.innerHTML = '🎵 Toca aquí o en cualquier parte para escuchar la música';
      pill.style.cssText = [
        'position: fixed',
        'top: 16px',
        'left: 50%',
        'transform: translateX(-50%)',
        'z-index: 9999',
        'background: rgba(253, 246, 236, 0.97)',
        'border: 1.5px solid #b89146',
        'color: #404040',
        'font-family: "Lato", sans-serif',
        'font-size: 13px',
        'font-weight: 600',
        'padding: 10px 20px',
        'border-radius: 999px',
        'box-shadow: 0 8px 28px rgba(64, 50, 25, 0.25)',
        'cursor: pointer',
        'white-space: nowrap',
        'animation: gentlePulse 2s infinite ease-in-out'
      ].join(';');

      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        this.play();
      });

      document.body.appendChild(pill);
    }

    removeUnlockPrompt() {
      const pill = document.getElementById('audio-unlock-pill');
      if (pill && pill.parentNode) {
        pill.parentNode.removeChild(pill);
      }
    }

    armAutoplayOnFirstGesture(onSuccessCallback = null) {
      if (this.isReallyPlaying()) {
        this.removeUnlockPrompt();
        if (onSuccessCallback) onSuccessCallback();
        return;
      }

      this.showUnlockPrompt();

      if (this.gestureArmed) return;
      this.gestureArmed = true;

      // Eventos reales de activación de audio en navegadores modernos
      const userEvents = ['pointerdown', 'touchstart', 'touchend', 'mousedown', 'keydown', 'click'];
      let completed = false;

      const triggerPlay = () => {
        if (completed || this.isReallyPlaying()) {
          completed = true;
          cleanup();
          return;
        }

        this.play().then(started => {
          if (started) {
            completed = true;
            this.hasUserInteracted = true;
            cleanup();
            if (onSuccessCallback) {
              try { onSuccessCallback(); } catch (e) {}
            }
          }
        }).catch(() => {});
      };

      const cleanup = () => {
        this.gestureArmed = false;
        this.removeUnlockPrompt();
        userEvents.forEach(ev => {
          window.removeEventListener(ev, triggerPlay, { capture: true });
          document.removeEventListener(ev, triggerPlay, { capture: true });
        });
      };

      userEvents.forEach(ev => {
        window.addEventListener(ev, triggerPlay, { capture: true, passive: true });
        document.addEventListener(ev, triggerPlay, { capture: true, passive: true });
      });
    }

    playSuccessChime() {
      this.initContext();
      const now = this.ctx.currentTime;
      this.playPianoNote(659.25, now, 1.5);
      this.playPianoNote(880.00, now + 0.15, 2.0);
      this.playPianoNote(1318.51, now + 0.3, 2.2);
    }
  }

  window.audioEngine = new RomanticAudioEngine();
})();
