/**
 * Auto-Scroll "Pasarela / Recorrido Guiado" & Audio Controller Engine — Carlos & Jackie Wedding
 * Provides cinematic, smooth auto-scrolling with Pause, Resume, Stop, Speed,
 * and unified Luxury Audio Controls (Play/Pause, Mute, Volume Slider),
 * plus customizable Smart Docking (Top/Bottom/Side) & Minimize mode to NEVER cover content.
 */

import { audioEngine } from './audio.js';

class AutoScrollController {
  constructor() {
    this.isActive = false;         // Is the tour active (started)
    this.isPaused = false;         // Is it temporarily paused
    this.isMinimized = false;      // Is the control bar minimized to corner pill
    this.dockPosition = 'bottom';  // 'bottom' or 'top' (for mobile / narrow view)
    this.speed = 48;               // Pixels per second (ideal leisurely reading pace)
    this.animationFrameId = null;
    this.lastTimestamp = null;
    this.container = null;
    this.widgetEl = null;
    this.userInteractingTimeout = null;
    this.audioUnsubscribe = null;

    // Bound listeners
    this.handleUserInteraction = this.handleUserInteraction.bind(this);
    this.animationLoop = this.animationLoop.bind(this);
    this.syncAudioState = this.syncAudioState.bind(this);
  }

  init(container) {
    this.container = container;
    this.createWidget();
    this.attachUserScrollListeners();

    // Listen to audio engine updates
    if (this.audioUnsubscribe) this.audioUnsubscribe();
    this.audioUnsubscribe = audioEngine.onStateChange((playing, state) => {
      this.syncAudioState(playing, state);
    });
  }

  destroy() {
    this.stop();
    this.removeUserScrollListeners();
    if (this.audioUnsubscribe) {
      this.audioUnsubscribe();
      this.audioUnsubscribe = null;
    }
    if (this.widgetEl && this.widgetEl.parentNode) {
      this.widgetEl.parentNode.removeChild(this.widgetEl);
    }
    this.widgetEl = null;
  }

  createWidget() {
    // Remove existing if any
    const existing = document.getElementById('runway-scroll-widget');
    if (existing) existing.remove();

    const widget = document.createElement('div');
    widget.id = 'runway-scroll-widget';
    widget.className = `runway-scroll-widget folded dock-${this.dockPosition}`;
    widget.innerHTML = `
      <!-- Minimized Corner Floating Pill (Discreet, zero obstruction) -->
      <button type="button" class="runway-btn-start" id="runway-btn-trigger" title="Abrir controles de pasarela y música">
        <span class="runway-icon-magic">✨</span>
        <span class="runway-start-text" id="runway-min-label">Pasarela & Música</span>
        <span class="runway-mini-music-icon" id="runway-min-audio-icon">🎵</span>
      </button>

      <!-- Active Floating Control Panel -->
      <div class="runway-active-bar" id="runway-active-bar">
        <!-- Progress Bar Line -->
        <div class="runway-progress-track">
          <div class="runway-progress-fill" id="runway-progress-fill"></div>
        </div>

        <!-- Top Header: Status, Progress & Window Management -->
        <div class="runway-header-row">
          <div class="runway-title-col">
            <span class="runway-badge" id="runway-status-badge">✦ Pasarela en curso</span>
            <span class="runway-progress-pct" id="runway-pct-label">0%</span>
          </div>

          <div class="runway-window-actions">
            <!-- Position Switcher (Top / Bottom) -->
            <button type="button" class="runway-mini-btn" id="runway-btn-dock" title="Cambiar posición (Arriba / Abajo)">
              ↕
            </button>
            <!-- Minimize Button -->
            <button type="button" class="runway-mini-btn" id="runway-btn-minimize" title="Minimizar panel a la esquina">
              —
            </button>
            <!-- Stop / Exit Button -->
            <button type="button" class="runway-mini-btn runway-btn-close-danger" id="runway-btn-stop" title="Detener pasarela por completo">
              ✕
            </button>
          </div>
        </div>

        <!-- Row 1: Runway Motion Controls -->
        <div class="runway-controls-row">
          <div class="runway-section-label">
            <span>PASARELA</span>
          </div>
          <div class="runway-buttons-group">
            <!-- Pause / Resume Button -->
            <button type="button" class="runway-ctrl-btn" id="runway-btn-toggle" title="Pausar o Reanudar recorrido">
              <span id="runway-toggle-icon">❚❚</span>
              <span id="runway-toggle-text">Pausar</span>
            </button>

            <!-- Speed Toggle (1x / 1.5x) -->
            <button type="button" class="runway-speed-btn" id="runway-btn-speed" title="Cambiar velocidad de desplazamiento">
              1x
            </button>
          </div>
        </div>

        <!-- Row 2: Wedding Audio Controls (Play/Pause, Mute, Volume Slider) -->
        <div class="runway-audio-row">
          <div class="runway-section-label">
            <span>MÚSICA</span>
          </div>
          <div class="runway-audio-controls">
            <!-- Audio Play / Pause -->
            <button type="button" class="runway-audio-btn" id="runway-audio-play" title="Reproducir o pausar música de fondo">
              <span id="runway-audio-play-icon">${audioEngine.isPlaying ? '❚❚' : '▶'}</span>
            </button>

            <!-- Audio Mute / Unmute -->
            <button type="button" class="runway-audio-btn" id="runway-audio-mute" title="Silenciar o activar sonido">
              <span id="runway-audio-mute-icon">${audioEngine.isMuted ? '🔇' : '🔊'}</span>
            </button>

            <!-- Volume Slider & Percentage -->
            <div class="runway-volume-wrap" title="Desliza para ajustar el volumen">
              <input 
                type="range" 
                class="runway-volume-slider" 
                id="runway-volume-slider" 
                min="0" 
                max="100" 
                value="${Math.round((audioEngine.getVolume() || 0.65) * 100)}" 
                step="1"
              >
              <span class="runway-volume-label" id="runway-volume-label">
                ${Math.round((audioEngine.getVolume() || 0.65) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(widget);
    this.widgetEl = widget;

    // Attach button events
    widget.querySelector('#runway-btn-trigger')?.addEventListener('click', () => {
      if (this.isMinimized && this.isActive) {
        this.expand();
      } else {
        this.start();
      }
    });

    widget.querySelector('#runway-btn-toggle')?.addEventListener('click', () => {
      this.togglePause();
    });

    widget.querySelector('#runway-btn-speed')?.addEventListener('click', (e) => {
      if (this.speed === 48) {
        this.speed = 85;
        e.currentTarget.textContent = '1.5x';
        e.currentTarget.classList.add('speed-boost');
      } else {
        this.speed = 48;
        e.currentTarget.textContent = '1x';
        e.currentTarget.classList.remove('speed-boost');
      }
    });

    widget.querySelector('#runway-btn-dock')?.addEventListener('click', () => {
      this.toggleDockPosition();
    });

    widget.querySelector('#runway-btn-minimize')?.addEventListener('click', () => {
      this.minimize();
    });

    widget.querySelector('#runway-btn-stop')?.addEventListener('click', () => {
      this.stop();
    });

    // Audio events
    widget.querySelector('#runway-audio-play')?.addEventListener('click', () => {
      audioEngine.toggleMusic();
    });

    widget.querySelector('#runway-audio-mute')?.addEventListener('click', () => {
      audioEngine.toggleMute();
    });

    const volSlider = widget.querySelector('#runway-volume-slider');
    volSlider?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      audioEngine.setVolume(val / 100);
      const label = widget.querySelector('#runway-volume-label');
      if (label) label.textContent = `${val}%`;
    });
  }

  attachUserScrollListeners() {
    window.addEventListener('wheel', this.handleUserInteraction, { passive: true });
    window.addEventListener('touchstart', this.handleUserInteraction, { passive: true });
    window.addEventListener('keydown', this.handleUserInteraction, { passive: true });
  }

  removeUserScrollListeners() {
    window.removeEventListener('wheel', this.handleUserInteraction);
    window.removeEventListener('touchstart', this.handleUserInteraction);
    window.removeEventListener('keydown', this.handleUserInteraction);
  }

  handleUserInteraction(e) {
    if (!this.isActive) return;

    // If keydown is not a navigation key, ignore
    if (e.type === 'keydown') {
      const navKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Space', 'Home', 'End'];
      if (!navKeys.includes(e.code)) return;
    }

    // Gracefully pause during manual interaction so it never fights the user's touch
    if (!this.isPaused) {
      this.pause(true); // pausedByManual = true
      this.updateUiState();

      // Show temporary hint
      clearTimeout(this.userInteractingTimeout);
      this.userInteractingTimeout = setTimeout(() => {
        const statusBadge = document.getElementById('runway-status-badge');
        if (statusBadge && this.isPaused) {
          statusBadge.textContent = '👆 Toca Reanudar';
        }
      }, 2200);
    }
  }

  start(fromTop = false) {
    this.isActive = true;
    this.isPaused = false;
    this.isMinimized = false;
    this.lastTimestamp = null;

    const maxScroll = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    ) - window.innerHeight;
    const currentY = window.scrollY || window.pageYOffset || 0;

    // If already at or near bottom, restart from top
    if (fromTop || currentY >= maxScroll - 40) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Try starting music if not yet playing
    try {
      if (audioEngine && !audioEngine.isPlaying) {
        audioEngine.play().catch(() => {});
      }
    } catch (e) {
      // Ignored if blocked
    }

    // Expand widget UI
    if (this.widgetEl) {
      this.widgetEl.classList.remove('folded', 'minimized');
      this.widgetEl.classList.add('active');
    }

    this.updateUiState();

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.animationFrameId = requestAnimationFrame(this.animationLoop);
  }

  pause(byManual = false) {
    if (!this.isActive) return;
    this.isPaused = true;
    this.lastTimestamp = null;
    this.updateUiState(byManual);
  }

  resume() {
    if (!this.isActive) {
      this.start();
      return;
    }
    this.isPaused = false;
    this.lastTimestamp = null;
    this.updateUiState();

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.animationFrameId = requestAnimationFrame(this.animationLoop);
  }

  togglePause() {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause(false);
    }
  }

  minimize() {
    this.isMinimized = true;
    if (this.widgetEl) {
      this.widgetEl.classList.add('minimized');
    }
  }

  expand() {
    this.isMinimized = false;
    if (this.widgetEl) {
      this.widgetEl.classList.remove('minimized');
    }
  }

  toggleDockPosition() {
    this.dockPosition = this.dockPosition === 'bottom' ? 'top' : 'bottom';
    if (this.widgetEl) {
      this.widgetEl.classList.remove('dock-bottom', 'dock-top');
      this.widgetEl.classList.add(`dock-${this.dockPosition}`);
    }
  }

  stop() {
    this.isActive = false;
    this.isPaused = false;
    this.isMinimized = false;
    this.lastTimestamp = null;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Fold widget to subtle button
    if (this.widgetEl) {
      this.widgetEl.classList.remove('active', 'minimized');
      this.widgetEl.classList.add('folded');
    }
  }

  animationLoop(timestamp) {
    if (!this.isActive || this.isPaused) {
      return;
    }

    if (!this.lastTimestamp) {
      this.lastTimestamp = timestamp;
    }

    const dt = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;

    const maxScroll = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    ) - window.innerHeight;

    const currentY = window.scrollY || window.pageYOffset || 0;

    // Check if reached the end of the invitation
    if (currentY >= maxScroll - 4) {
      this.onReachedEnd();
      return;
    }

    // Advance scroll smoothly
    const advance = this.speed * dt;
    const nextY = Math.min(maxScroll, currentY + advance);
    window.scrollTo(0, nextY);

    // Update progress
    this.updateProgress(nextY, maxScroll);

    this.animationFrameId = requestAnimationFrame(this.animationLoop);
  }

  updateProgress(current, max) {
    const pct = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
    const fill = document.getElementById('runway-progress-fill');
    const label = document.getElementById('runway-pct-label');
    const minLabel = document.getElementById('runway-min-label');

    if (fill) fill.style.width = `${pct}%`;
    if (label) label.textContent = `${pct}%`;
    if (minLabel && this.isActive) minLabel.textContent = `Pasarela ${pct}%`;
  }

  onReachedEnd() {
    const statusBadge = document.getElementById('runway-status-badge');
    const toggleBtn = document.getElementById('runway-btn-toggle');

    if (statusBadge) statusBadge.textContent = '✨ Fin del Recorrido';
    if (toggleBtn) toggleBtn.style.display = 'none';

    // Auto-stop after 3.5 seconds at bottom
    setTimeout(() => {
      this.stop();
      if (toggleBtn) toggleBtn.style.display = '';
    }, 3500);
  }

  updateUiState(byManual = false) {
    const badge = document.getElementById('runway-status-badge');
    const icon = document.getElementById('runway-toggle-icon');
    const text = document.getElementById('runway-toggle-text');

    if (this.isPaused) {
      if (badge) badge.textContent = byManual ? '❚❚ Pausado por desplazamiento' : '❚❚ Recorrido Pausado';
      if (icon) icon.textContent = '▶';
      if (text) text.textContent = 'Reanudar';
    } else {
      if (badge) badge.textContent = '✦ Pasarela en curso';
      if (icon) icon.textContent = '❚❚';
      if (text) text.textContent = 'Pausar';
    }
  }

  syncAudioState(playing, state = {}) {
    if (!this.widgetEl) return;

    const playIcon = this.widgetEl.querySelector('#runway-audio-play-icon');
    const muteIcon = this.widgetEl.querySelector('#runway-audio-mute-icon');
    const slider = this.widgetEl.querySelector('#runway-volume-slider');
    const volLabel = this.widgetEl.querySelector('#runway-volume-label');
    const minAudioIcon = this.widgetEl.querySelector('#runway-min-audio-icon');

    const isPlaying = state.isPlaying !== undefined ? state.isPlaying : playing;
    const isMuted = state.isMuted !== undefined ? state.isMuted : audioEngine.isMuted;
    const volume = state.volume !== undefined ? state.volume : audioEngine.getVolume();
    const volPct = Math.round(volume * 100);

    if (playIcon) playIcon.textContent = isPlaying ? '❚❚' : '▶';
    if (muteIcon) muteIcon.textContent = isMuted ? '🔇' : '🔊';
    if (slider) slider.value = volPct;
    if (volLabel) volLabel.textContent = `${volPct}%`;
    if (minAudioIcon) minAudioIcon.textContent = isPlaying ? '🎵' : '⏸️';
  }
}

export const autoScrollController = new AutoScrollController();
