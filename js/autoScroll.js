/**
 * Auto-Scroll "Pasarela / Recorrido Guiado" & Audio Controller Engine — Carlos & Jackie Wedding
 * Inicia siempre de forma automática al ingresar o actualizar la página.
 * Velocidad predeterminada: 2x (con selector directo para 1x, 2x y 3x).
 * Bucle continuo y acumulador flotante sub-píxel para que nunca se detenga prematuramente.
 */

(function () {
  // Evitar que el navegador restaure el scroll al final al actualizar (F5)
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  const SPEED_MAP = {
    1: 48,   // 1x
    2: 96,   // 2x (Predeterminado)
    3: 144   // 3x
  };

  class AutoScrollController {
    constructor() {
      this.isActive = false;
      this.isPaused = false;
      this.pausedByManual = false;
      this.isMinimized = false;
      this.dockPosition = 'bottom';
      this.speedMultiplier = 2; // Velocidad predeterminada en x2
      this.speed = SPEED_MAP[2];
      this.virtualY = 0;
      this.animationFrameId = null;
      this.lastTimestamp = null;
      this.container = null;
      this.widgetEl = null;
      this.userInteractingTimeout = null;
      this.endLoopTimeout = null;
      this.audioUnsubscribe = null;
      this.touchStartY = null;

      this.handleWheelOrKey = this.handleWheelOrKey.bind(this);
      this.handleTouchStart = this.handleTouchStart.bind(this);
      this.handleTouchMove = this.handleTouchMove.bind(this);
      this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
      this.animationLoop = this.animationLoop.bind(this);
      this.syncAudioState = this.syncAudioState.bind(this);
    }

    init(container) {
      this.container = container || document.body;
      this.createWidget();
      this.attachUserScrollListeners();

      if (this.audioUnsubscribe) this.audioUnsubscribe();
      if (window.audioEngine) {
        this.audioUnsubscribe = window.audioEngine.onStateChange((playing, state) => {
          this.syncAudioState(playing, state);
        });
      }
    }

    createWidget() {
      const existing = document.getElementById('runway-scroll-widget');
      if (existing) existing.remove();

      const audioEngine = window.audioEngine;
      const initialVol = audioEngine ? Math.round((audioEngine.getVolume() || 0.65) * 100) : 65;

      const widget = document.createElement('div');
      widget.id = 'runway-scroll-widget';
      widget.className = `runway-scroll-widget folded dock-${this.dockPosition}`;
      widget.innerHTML = `
        <button type="button" class="runway-btn-start" id="runway-btn-trigger" title="Abrir controles de pasarela y música">
          <span class="runway-icon-magic">✨</span>
          <span class="runway-start-text" id="runway-min-label">Pasarela & Música</span>
          <span class="runway-mini-music-icon" id="runway-min-audio-icon">🎵</span>
        </button>

        <div class="runway-active-bar" id="runway-active-bar">
          <div class="runway-progress-track">
            <div class="runway-progress-fill" id="runway-progress-fill"></div>
          </div>

          <div class="runway-header-row">
            <div class="runway-title-col">
              <span class="runway-badge" id="runway-status-badge">✦ Pasarela en curso</span>
              <span class="runway-progress-pct" id="runway-pct-label">0%</span>
            </div>

            <div class="runway-window-actions">
              <button type="button" class="runway-mini-btn" id="runway-btn-dock" title="Cambiar posición (Arriba / Abajo)">
                ↕
              </button>
              <button type="button" class="runway-mini-btn" id="runway-btn-minimize" title="Minimizar panel a la esquina">
                —
              </button>
              <button type="button" class="runway-mini-btn runway-btn-close-danger" id="runway-btn-stop" title="Detener pasarela por completo">
                ✕
              </button>
            </div>
          </div>

          <div class="runway-controls-row">
            <div class="runway-section-label">
              <span>PASARELA</span>
            </div>
            <div class="runway-buttons-group">
              <button type="button" class="runway-ctrl-btn" id="runway-btn-toggle" title="Pausar o Reanudar recorrido">
                <span id="runway-toggle-icon">❚❚</span>
                <span id="runway-toggle-text">Pausar</span>
              </button>

              <div class="runway-speed-group" role="group" aria-label="Velocidad de pasarela">
                <button type="button" class="runway-speed-btn ${this.speedMultiplier === 1 ? 'active' : ''}" data-speed="1" title="Velocidad 1x">
                  1x
                </button>
                <button type="button" class="runway-speed-btn ${this.speedMultiplier === 2 ? 'active' : ''}" data-speed="2" title="Velocidad 2x (Predeterminada)">
                  2x
                </button>
                <button type="button" class="runway-speed-btn ${this.speedMultiplier === 3 ? 'active' : ''}" data-speed="3" title="Velocidad 3x">
                  3x
                </button>
              </div>
            </div>
          </div>

          <div class="runway-audio-row">
            <div class="runway-section-label">
              <span>MÚSICA</span>
            </div>
            <div class="runway-audio-controls">
              <button type="button" class="runway-audio-btn" id="runway-audio-play" title="Reproducir o pausar música de fondo">
                <span id="runway-audio-play-icon">${audioEngine && audioEngine.isPlaying ? '❚❚' : '▶'}</span>
              </button>

              <button type="button" class="runway-audio-btn" id="runway-audio-mute" title="Silenciar o activar sonido">
                <span id="runway-audio-mute-icon">${audioEngine && audioEngine.isMuted ? '🔇' : '🔊'}</span>
              </button>

              <div class="runway-volume-wrap" title="Desliza para ajustar el volumen">
                <input 
                  type="range" 
                  class="runway-volume-slider" 
                  id="runway-volume-slider" 
                  min="0" 
                  max="100" 
                  value="${initialVol}" 
                  step="1"
                >
                <span class="runway-volume-label" id="runway-volume-label">
                  ${initialVol}%
                </span>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(widget);
      this.widgetEl = widget;

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

      widget.querySelectorAll('.runway-speed-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const mult = parseInt(btn.getAttribute('data-speed') || '2', 10);
          this.setSpeedMultiplier(mult);
        });
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

      widget.querySelector('#runway-audio-play')?.addEventListener('click', () => {
        audioEngine?.toggleMusic();
      });

      widget.querySelector('#runway-audio-mute')?.addEventListener('click', () => {
        audioEngine?.toggleMute();
      });

      const volSlider = widget.querySelector('#runway-volume-slider');
      volSlider?.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        audioEngine?.setVolume(val / 100);
        const label = widget.querySelector('#runway-volume-label');
        if (label) label.textContent = `${val}%`;
      });
    }

    setSpeedMultiplier(mult) {
      const validMult = SPEED_MAP[mult] ? mult : 2;
      this.speedMultiplier = validMult;
      this.speed = SPEED_MAP[validMult];

      if (this.widgetEl) {
        this.widgetEl.querySelectorAll('.runway-speed-btn').forEach(btn => {
          const btnMult = parseInt(btn.getAttribute('data-speed') || '0', 10);
          btn.classList.toggle('active', btnMult === validMult);
        });
      }

      // Si estaba en pausa temporal por toque del usuario, al cambiar velocidad reanudamos de inmediato
      if (this.isActive && this.isPaused) {
        this.resume();
      }
    }

    attachUserScrollListeners() {
      window.addEventListener('wheel', this.handleWheelOrKey, { passive: true });
      window.addEventListener('keydown', this.handleWheelOrKey, { passive: true });
      window.addEventListener('touchstart', this.handleTouchStart, { passive: true });
      window.addEventListener('touchmove', this.handleTouchMove, { passive: true });
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    handleVisibilityChange() {
      if (!document.hidden && this.isActive && !this.isPaused) {
        this.lastTimestamp = null;
        this.virtualY = window.scrollY || window.pageYOffset || 0;
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = requestAnimationFrame(this.animationLoop);
      }
    }

    handleTouchStart(e) {
      if (e.touches && e.touches.length > 0) {
        this.touchStartY = e.touches[0].clientY;
      }
    }

    handleTouchMove(e) {
      if (!this.isActive || (this.isPaused && !this.pausedByManual) || this.touchStartY === null) return;
      if (this.widgetEl && this.widgetEl.contains(e.target)) return;

      if (e.touches && e.touches.length > 0) {
        const deltaY = Math.abs(e.touches[0].clientY - this.touchStartY);
        // Solo pausar temporalmente si el usuario desliza el dedo intencionalmente (> 22px)
        if (deltaY > 22) {
          this.pauseByUserScroll();
        }
      }
    }

    handleWheelOrKey(e) {
      if (!this.isActive || (this.isPaused && !this.pausedByManual)) return;
      if (this.widgetEl && this.widgetEl.contains(e.target)) return;

      if (e.type === 'keydown') {
        const navKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Space', 'Home', 'End'];
        if (!navKeys.includes(e.code)) return;
      }

      this.pauseByUserScroll();
    }

    pauseByUserScroll() {
      this.pausedByManual = true;
      this.isPaused = true;
      this.lastTimestamp = null;
      this.updateUiState(true);

      // Reanudar automáticamente tras 2.5 segundos de inactividad para que la pasarela NUNCA quede detenida sola
      clearTimeout(this.userInteractingTimeout);
      this.userInteractingTimeout = setTimeout(() => {
        if (this.isActive && this.isPaused && this.pausedByManual) {
          this.pausedByManual = false;
          this.virtualY = window.scrollY || window.pageYOffset || 0;
          this.resume();
        }
      }, 2500);
    }

    /**
     * Inicia SIEMPRE la pasarela automática (en x2 por defecto) y la música al entrar o actualizar la web
     */
    startSynchronizedTour({ delayMs = 450 } = {}) {
      if (this.autoplayTimer) {
        clearTimeout(this.autoplayTimer);
        this.autoplayTimer = null;
      }

      // 1. Posicionar al inicio del pliego siempre al entrar o recargar
      window.scrollTo(0, 0);
      this.virtualY = 0;

      // 2. Iniciar la pasarela automática incondicionalmente tras el breve delay inicial
      this.autoplayTimer = setTimeout(() => {
        this.autoplayTimer = null;
        window.scrollTo(0, 0);
        this.virtualY = 0;
        this.start(false);
      }, delayMs);

      // 3. Iniciar la música automáticamente (y dejar armado el desbloqueo instantáneo si el navegador lo requiere)
      const audioEngine = window.audioEngine;
      if (audioEngine) {
        audioEngine.play().then(started => {
          if (!started) {
            audioEngine.armAutoplayOnFirstGesture();
          }
        }).catch(() => {
          audioEngine.armAutoplayOnFirstGesture();
        });
      }
    }

    start(fromTop = false) {
      if (this.autoplayTimer) {
        clearTimeout(this.autoplayTimer);
        this.autoplayTimer = null;
      }
      clearTimeout(this.userInteractingTimeout);
      clearTimeout(this.endLoopTimeout);

      this.isActive = true;
      this.isPaused = false;
      this.pausedByManual = false;
      this.isMinimized = false;
      this.lastTimestamp = null;

      const maxScroll = this.getMaxScroll();
      const currentY = window.scrollY || window.pageYOffset || 0;

      if (fromTop || (maxScroll > 100 && currentY >= maxScroll - 30)) {
        window.scrollTo(0, 0);
        this.virtualY = 0;
      } else {
        this.virtualY = currentY;
      }

      try {
        if (window.audioEngine && !window.audioEngine.isPlaying) {
          window.audioEngine.play().catch(() => {});
        }
      } catch (e) {}

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
      clearTimeout(this.userInteractingTimeout);
      this.isPaused = true;
      this.pausedByManual = byManual;
      this.lastTimestamp = null;
      this.updateUiState(byManual);
    }

    resume() {
      if (!this.isActive) {
        this.start();
        return;
      }
      clearTimeout(this.userInteractingTimeout);
      clearTimeout(this.endLoopTimeout);
      this.isPaused = false;
      this.pausedByManual = false;
      this.lastTimestamp = null;
      this.virtualY = window.scrollY || window.pageYOffset || 0;
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
        // Pausa explícita del usuario en el botón "Pausar"
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
      if (this.autoplayTimer) {
        clearTimeout(this.autoplayTimer);
        this.autoplayTimer = null;
      }
      clearTimeout(this.userInteractingTimeout);
      clearTimeout(this.endLoopTimeout);

      this.isActive = false;
      this.isPaused = false;
      this.pausedByManual = false;
      this.isMinimized = false;
      this.lastTimestamp = null;

      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      if (this.widgetEl) {
        this.widgetEl.classList.remove('active', 'minimized');
        this.widgetEl.classList.add('folded');
      }
    }

    getMaxScroll() {
      const docHeight = Math.max(
        document.body ? document.body.scrollHeight : 0,
        document.documentElement ? document.documentElement.scrollHeight : 0,
        document.body ? document.body.offsetHeight : 0,
        document.documentElement ? document.documentElement.offsetHeight : 0
      );
      return Math.max(0, docHeight - window.innerHeight);
    }

    animationLoop(timestamp) {
      if (!this.isActive || this.isPaused) {
        return;
      }

      if (!this.lastTimestamp) {
        this.lastTimestamp = timestamp;
        this.virtualY = window.scrollY || window.pageYOffset || 0;
      }

      // Limitar dt máximo a 100ms para evitar saltos bruscos al cambiar de pestaña
      const rawDt = (timestamp - this.lastTimestamp) / 1000;
      const dt = Math.min(Math.max(rawDt, 0), 0.1);
      this.lastTimestamp = timestamp;

      const maxScroll = this.getMaxScroll();
      const actualY = window.scrollY || window.pageYOffset || 0;

      // Si la posición real difiere mucho del acumulador (por carga de imágenes o resize), sincronizar
      if (Math.abs(actualY - this.virtualY) > 60) {
        this.virtualY = actualY;
      }

      if (maxScroll > 80 && this.virtualY >= maxScroll - 2) {
        this.updateProgress(maxScroll, maxScroll);
        this.onReachedEnd();
        return;
      }

      const advance = this.speed * dt;
      this.virtualY = Math.min(maxScroll, this.virtualY + advance);
      window.scrollTo(0, Math.round(this.virtualY));

      this.updateProgress(this.virtualY, maxScroll);

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
      if (statusBadge) statusBadge.textContent = '✨ Reiniciando recorrido...';

      // En lugar de apagar la pasarela al llegar al final, hace una breve pausa y vuelve a empezar continuamente
      clearTimeout(this.endLoopTimeout);
      this.endLoopTimeout = setTimeout(() => {
        if (!this.isActive || this.isPaused) return;
        window.scrollTo(0, 0);
        this.virtualY = 0;
        this.lastTimestamp = null;
        this.updateUiState();
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = requestAnimationFrame(this.animationLoop);
      }, 3000);
    }

    updateUiState(byManual = false) {
      const badge = document.getElementById('runway-status-badge');
      const icon = document.getElementById('runway-toggle-icon');
      const text = document.getElementById('runway-toggle-text');

      if (this.isPaused) {
        if (badge) badge.textContent = byManual ? '❚❚ Lectura manual (reanudando...)' : '❚❚ Recorrido Pausado';
        if (icon) icon.textContent = '▶';
        if (text) text.textContent = 'Reanudar';
      } else {
        if (badge) badge.textContent = `✦ Pasarela (${this.speedMultiplier}x)`;
        if (icon) icon.textContent = '❚❚';
        if (text) text.textContent = 'Pausar';
      }
    }

    syncAudioState(playing, state = {}) {
      if (!this.widgetEl) return;

      const audioEngine = window.audioEngine;
      const playIcon = this.widgetEl.querySelector('#runway-audio-play-icon');
      const muteIcon = this.widgetEl.querySelector('#runway-audio-mute-icon');
      const slider = this.widgetEl.querySelector('#runway-volume-slider');
      const volLabel = this.widgetEl.querySelector('#runway-volume-label');
      const minAudioIcon = this.widgetEl.querySelector('#runway-min-audio-icon');

      const isPlaying = state.isPlaying !== undefined ? state.isPlaying : playing;
      const isMuted = state.isMuted !== undefined ? state.isMuted : (audioEngine ? audioEngine.isMuted : false);
      const volume = state.volume !== undefined ? state.volume : (audioEngine ? audioEngine.getVolume() : 0.65);
      const volPct = Math.round(volume * 100);

      if (playIcon) playIcon.textContent = isPlaying ? '❚❚' : '▶';
      if (muteIcon) muteIcon.textContent = isMuted ? '🔇' : '🔊';
      if (slider) slider.value = volPct;
      if (volLabel) volLabel.textContent = `${volPct}%`;
      if (minAudioIcon) minAudioIcon.textContent = isPlaying ? '🎵' : '⏸️';
    }
  }

  window.autoScrollController = new AutoScrollController();
})();
