/**
 * Clean Wedding Landing Page View — Carlos & Jackie
 * Built following the clickandlove-wedding-style skill specification
 */

import confetti from 'canvas-confetti';
import { storage } from '../services/storage.js';
import { generateQrDataUrl, getCheckinUrl } from '../services/qrService.js';
import { downloadGuestPdf } from '../services/pdfService.js';
import { audioEngine } from '../utils/audio.js';
import { MUSIC_CONFIG } from '../config/musicConfig.js';
import { showToast } from '../utils/toast.js';
import { autoScrollController } from '../utils/autoScroll.js';

let countdownInterval = null;
let rsvpDrawerOpen = false;

export async function renderLandingView(container, guestToken = null) {
  // Clear any existing countdown
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  // Find guest
  const guests = storage.getGuests();
  let guest = null;

  if (guestToken) {
    guest = storage.getGuestById(guestToken);
  }

  // Fallback to first guest or default
  if (!guest && guests.length > 0) {
    guest = guests[0];
  }

  if (!guest) {
    guest = {
      id: 'INV-CARLOS-JACKIE',
      name: 'Invitado Especial',
      passes: 2,
      confirmedPasses: 2,
      attendedPasses: 0,
      table: 'Mesa Principal',
      customNote: '¡Será un gran honor contar con su grata presencia!',
      status: 'pendiente'
    };
  }

  // Pre-generate QR code for pass
  const checkinUrl = getCheckinUrl(guest.id);
  const qrDataUrl = await generateQrDataUrl(checkinUrl, { width: 200, margin: 1 });

  // If already confirmed or opened previously, drawer can be visible or toggled
  const isAlreadyConfirmed = guest.status === 'confirmada' || guest.status === 'ingreso';

  container.innerHTML = `
    <div class="wedding-body">
      <div class="paper-strip">

        <!-- ==========================================================================
             SECCIÓN 0 & 1: HERO + FOTO DESVANECIDA + NOMBRES + RETRATO 1 + DALE PLAY
             ========================================================================== -->
        <div class="hero-wrapper">
          <div class="hero-photo-container">
            <img src="/assets/carlos_jackie_1.jpg" alt="Carlos y Jackie" class="hero-photo">
          </div>

          <div class="hero-titles">
            <div class="nos-casamos">¡NOS CASAMOS!</div>
            <h1 class="couple-names-hero">Carlos
y
Jackie</h1>
          </div>
        </div>

        <div class="content-col">
          <!-- Tarjeta de Invitado Impresa en el Pliego (Letterpress sobre Papel) -->
          <div class="guest-letterpress-box">
            <div class="guest-letterpress-label">PASE EXCLUSIVO PARA</div>
            <div class="guest-letterpress-name">${guest.name}</div>
            <div class="guest-letterpress-meta">
              <span>🎟️ Válido por ${guest.passes} Pase${guest.passes > 1 ? 's' : ''}</span>
              <span>🍽️ ${guest.table || 'Mesa asignada'}</span>
            </div>
            ${guest.customNote ? `
              <div class="guest-letterpress-note">"${guest.customNote}"</div>
            ` : ''}
          </div>

          <!-- Primer Retrato de Pareja con Bordes Difuminados en Acuarela -->
          <div class="watercolor-portrait-frame">
            <img src="/assets/carlos_jackie_3_feathered.png" alt="Carlos y Jackie">
          </div>

          <!-- Reproductor Dibujado a Mano "¡Dale play!" -->
          <div class="dale-play-widget" id="btn-dale-play" title="Toca para reproducir o pausar la música">
            <img src="/assets/clickandlove/media/music-player-frame.svg" alt="Reproductor de música" class="dale-play-svg">
            <div class="dale-play-arrow">
              <svg viewBox="0 0 48 36" fill="none" stroke="#333231" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="arrow-drawn-vector">
                <path d="M 6 28 C 14 16, 24 8, 38 6" />
                <path d="M 28 3 L 39 6 L 33 14" />
              </svg>
            </div>
            <div class="dale-play-text" id="dale-play-label">¡Dale play!</div>
          </div>

          <!-- Párrafo Emotivo -->
          <p class="story-paragraph">
            Nos encontramos, crecimos juntos y ahora queremos celebrar este nuevo capítulo rodeados de las personas que más queremos y han sido parte de nuestro camino.
          </p>

          <!-- ==========================================================================
               SECCIÓN 2: FAMILIA Y BENDICIONES
               ========================================================================== -->
          <section class="family-section">
            <div class="family-block">
              <div class="family-heading">Con la bendición y el amor de:</div>
              <div class="family-names">Nuestras familias y seres queridos</div>
            </div>
          </section>

          <!-- ==========================================================================
               SECCIÓN 3: FECHA Y CUENTA REGRESIVA
               ========================================================================== -->
          <section class="date-section">
            <div class="date-intro">¡Llegó el día para celebrar juntos!</div>
            <div class="date-main">26 | DICIEMBRE | 2026</div>
            <div class="date-time">7:00PM</div>

            <!-- Contador regresivo estilo TickCounter sobre el papel -->
            <div class="tickcounter-box">
              <div class="tc-unit">
                <span class="tc-val" id="cd-days">00</span>
                <span class="tc-lbl">Días</span>
              </div>
              <div class="tc-unit">
                <span class="tc-val" id="cd-hours">00</span>
                <span class="tc-lbl">Horas</span>
              </div>
              <div class="tc-unit">
                <span class="tc-val" id="cd-minutes">00</span>
                <span class="tc-lbl">Minutos</span>
              </div>
              <div class="tc-unit">
                <span class="tc-val" id="cd-seconds">00</span>
                <span class="tc-lbl">Segundos</span>
              </div>
            </div>

            <button id="btn-add-cal" class="btn-editorial-rect" style="margin-top: 22px;">
              AGENDAR
            </button>
          </section>

          <!-- ==========================================================================
               SECCIÓN 4: RECEPCIÓN Y FIESTA (UBICACIÓN VILLA VENECIA)
               ========================================================================== -->
          <section class="ceremony-section">
            <img src="/assets/clickandlove/media/rings-bow.png" alt="Anillos con lazo" class="ceremony-rings-img">
            <div class="section-script-title">Recepción<br>y fiesta</div>

            <div class="ceremony-address">Recepciones Villa Venecia
Av. 13 De Enero 1532
(a espaldas del parque Zonal Huiracocha)
San Juan de Lurigancho</div>

            <p style="font-size: 16px; font-style: italic; color: #555555; margin-bottom: 22px;">
              Boda civil: acompáñanos a celebrar y brindar en nuestra recepción.
            </p>

            <div class="location-btn-row">
              <a href="https://www.google.com/maps/search/?api=1&query=Av.+13+De+Enero+1532+San+Juan+de+Lurigancho" target="_blank" rel="noopener noreferrer" class="btn-editorial-rect">
                UBICACIÓN
              </a>
              <a href="https://waze.com/ul?q=Av.+13+De+Enero+1532+San+Juan+de+Lurigancho" target="_blank" rel="noopener noreferrer" class="btn-editorial-rect">
                WAZE
              </a>
            </div>
          </section>

          <!-- ==========================================================================
               SECCIÓN 5: ITINERARIO (TIMELINE VERTICAL CON ACUARELAS ORIGINALES)
               ========================================================================== -->
          <section class="itinerary-section">
            <div class="itinerary-title">Itinerario</div>

            <div class="timeline-canvas">
              <div class="timeline-line"></div>
              <div class="timeline-node node-1"></div>
              <div class="timeline-node node-2"></div>
              <div class="timeline-node node-3"></div>
              <div class="timeline-node node-4"></div>

              <!-- Hito 1: Recepción (Izquierda) -->
              <div class="tl-item tl-left tl-item-1">
                <div class="tl-wash-wrap">
                  <img src="/assets/clickandlove/media/watercolor-wash-sage.png" class="tl-wash-img" alt="Acuarela">
                  <img src="/assets/clickandlove/media/rings-box.png" class="tl-rings-box-img" alt="Caja de anillos">
                </div>
                <div class="tl-label">Recepción<br>7:00pm</div>
              </div>

              <!-- Hito 2: Cena de Gala (Derecha) -->
              <div class="tl-item tl-right tl-item-2">
                <img src="/assets/clickandlove/media/plate-cutlery.png" class="tl-plate-img" alt="Cena">
                <div class="tl-label">Cena<br>8:30pm</div>
              </div>

              <!-- Hito 3: Brindis (Izquierda) -->
              <div class="tl-item tl-left tl-item-3">
                <img src="/assets/clickandlove/media/champagne-flutes.png" class="tl-flutes-img" alt="Brindis">
                <div class="tl-label">Brindis<br>9:30pm</div>
              </div>

              <!-- Hito 4: Fiesta y Baile (Derecha) -->
              <div class="tl-item tl-right tl-item-4">
                <div class="tl-disco-wrap">
                  <img src="/assets/clickandlove/media/disco-ball.png" class="tl-disco-img" alt="Bola disco">
                  <img src="/assets/clickandlove/media/sparkles-gold.png" class="tl-sparkles-img" alt="Destellos">
                </div>
                <div class="tl-label">Fiesta<br>10:00pm</div>
              </div>
            </div>
          </section>

          <!-- ==========================================================================
               SECCIÓN 6: DRESS CODE + MUESTRAS DE ACUARELA ORIGINALES
               ========================================================================== -->
          <section class="dresscode-section">
            <div class="dresscode-title">Dress code</div>
            <div class="dresscode-sub">Casual elegante</div>

            <div class="dresscode-illustrations">
              <img src="/assets/clickandlove/media/dress-watercolor.png" class="img-dress" alt="Vestido en acuarela">
              <img src="/assets/clickandlove/media/suit-watercolor.png" class="img-suit" alt="Terno en acuarela">
            </div>

            <div class="dresscode-text">
              Damas: Vestido • Caballeros: Terno<br>
              Queremos que vivas nuestra fiesta al máximo y disfrutes cada momento en la pista de baile.
            </div>

            <div class="dresscode-avoid">
              Evitar los colores: blanco, ivory y beige.
            </div>

            <div class="swatches-row">
              <div class="swatch-wrap">
                <img src="/assets/clickandlove/media/swatch-white.png" class="swatch-img" alt="Blanco">
                <span class="swatch-name">Blanco</span>
              </div>
              <div class="swatch-wrap">
                <img src="/assets/clickandlove/media/swatch-ivory.png" class="swatch-img" alt="Ivory">
                <span class="swatch-name">Ivory</span>
              </div>
              <div class="swatch-wrap">
                <img src="/assets/clickandlove/media/swatch-beige.png" class="swatch-img" alt="Beige">
                <span class="swatch-name">Beige</span>
              </div>
            </div>
          </section>

          <!-- ==========================================================================
               SECCIÓN INTERMEDIA: NUESTROS MOMENTOS EN ACUARELA
               ========================================================================== -->
          <section class="moments-section">
            <div class="moments-title">Nuestros Momentos</div>
            <div class="moments-portrait-frame">
              <img src="/assets/carlos_jackie_2_feathered.png" alt="Carlos y Jackie en las montañas" class="moments-photo" title="Toca para ver en detalle">
            </div>
            <p class="story-paragraph" style="margin-top: 14px; font-style: italic;">
              "Cada aventura y cada paso juntos nos han traído hasta este gran día."
            </p>
          </section>

          <!-- ==========================================================================
               SECCIÓN 7: MESA DE REGALOS (LLUVIA DE SOBRES)
               ========================================================================== -->
          <section class="gifts-section">
            <img src="/assets/clickandlove/media/gift-box-sage.png" class="gift-box-img" alt="Caja de regalo">
            <div class="gifts-title">Mesa de regalos</div>

            <div class="gifts-note">
              Estamos felices con tu compañía, y si deseas puedes contribuir a nuestros proyectos y sueños como familia.
            </div>

            <div class="gifts-accounts">
              <strong>Cta. BCP Soles</strong>  191-98765432-0-11
              <button class="copy-inline-btn" data-copy="191-98765432-0-11">Copiar Cuenta</button>
              <strong>CCI</strong>  002-191009876543201155
              <button class="copy-inline-btn" data-copy="002191009876543201155">Copiar CCI</button>

              <strong>Cta. BBVA Soles</strong>  0011-0234-0200987654
              <button class="copy-inline-btn" data-copy="0011-0234-0200987654">Copiar Cuenta</button>
              <strong>CCI</strong>  011-23400020098765412
              <button class="copy-inline-btn" data-copy="01123400020098765412">Copiar CCI</button>

              <strong>Yape / Plin</strong>  987 654 321
              <button class="copy-inline-btn" data-copy="987654321">Copiar Número</button>
            </div>
          </section>

          <!-- ==========================================================================
               SECCIÓN 8: TÓMALO EN CUENTA (SOLO ADULTOS)
               ========================================================================== -->
          <section class="adults-section">
            <img src="/assets/clickandlove/media/lightbulb-watercolor.png" class="lightbulb-img" alt="Bombilla acuarela">
            <div class="adults-title">Tómalo en cuenta</div>
            <div class="adults-text">
              Queremos que vivas nuestra boda al máximo y que nunca dejes la pista de baile. Por ello, nuestra celebración será exclusiva para adultos. Agradecemos su comprensión.
            </div>
          </section>

          <!-- ==========================================================================
               SECCIÓN 9: CONFIRMAR ASISTENCIA (RSVP + PASE QR EDITORIAL)
               ========================================================================== -->
          <section class="rsvp-section" id="rsvp-section">
            <div class="rsvp-title">Confirmar asistencia</div>
            <div class="rsvp-text">
              Te pedimos nos puedas confirmar tu asistencia hasta el <strong>10 de diciembre</strong> en el siguiente link:
            </div>

            <button class="btn-confirmar-rect" id="btn-toggle-rsvp">
              ${isAlreadyConfirmed ? 'VER MI PASE / EDITAR' : 'CONFIRMAR'}
            </button>

            <!-- Formulario Desplegable Editorial -->
            <div class="editorial-rsvp-drawer" id="editorial-rsvp-drawer" style="display: ${isAlreadyConfirmed || rsvpDrawerOpen ? 'block' : 'none'};">
              <form id="editorial-rsvp-form">
                <div class="editorial-form-group" style="margin-bottom: 16px;">
                  <label style="font-family: 'RoxboroughCF', serif; font-size: 19px; color: var(--ink-charcoal); display: block; margin-bottom: 12px;">
                    ¿Nos acompañas en este gran día?
                  </label>
                  <div class="editorial-radio-grid">
                    <button type="button" class="editorial-radio-btn ${guest.status !== 'declinada' ? 'active' : ''}" id="radio-opt-yes">
                      ¡SÍ, ASISTIRÉ!
                    </button>
                    <button type="button" class="editorial-radio-btn ${guest.status === 'declinada' ? 'active' : ''}" id="radio-opt-no">
                      NO PODRÉ ASISTIR
                    </button>
                  </div>
                </div>

                <button type="submit" class="btn-confirmar-rect" style="width: 100%; margin-top: 6px;">
                  CONFIRMAR RESPUESTA
                </button>
              </form>

              <!-- Pase QR Oficial Integrado en el Pliego -->
              ${isAlreadyConfirmed ? `
                <div class="editorial-qr-pass" id="editorial-qr-mount">
                  <div style="font-family: 'Lato', sans-serif; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-charcoal);">
                    PASE OFICIAL DE ACCESO • VILLA VENECIA
                  </div>
                  <div style="font-family: 'RoxboroughCF', serif; font-size: 20px; font-weight: 700; color: var(--ink-deep); margin: 4px 0;">
                    ${guest.name}
                  </div>
                  <div style="font-family: monospace; font-size: 13px; color: var(--ink-body);">
                    ${guest.id}
                  </div>

                  <div class="qr-canvas-frame">
                    <img src="${qrDataUrl}" alt="Código QR de Acceso" style="width: 170px; height: 170px; display: block;">
                  </div>

                  <div style="font-family: 'RoxboroughCF', serif; font-size: 15px; color: var(--ink-body); margin-bottom: 8px;">
                    ${guest.confirmedPasses || guest.passes} Pases Autorizados • ${guest.table || 'Mesa asignada'}
                  </div>

                  <button id="btn-download-pdf" class="btn-editorial-rect" style="width: auto; height: 34px; font-size: 14px; padding: 0 16px;">
                    DESCARGAR PASE EN PDF
                  </button>
                </div>
              ` : ''}
            </div>
          </section>

          <!-- ==========================================================================
               SECCIÓN 10: CIERRE ("¡Te esperamos! Carlos y Jackie" + RETRATO 2)
               ========================================================================== -->
          <section class="closing-section">
            <div class="closing-wait">¡Te esperamos!</div>
            <div class="closing-names">Carlos y Jackie</div>
            <img src="/assets/carlos_jackie_4_feathered.png" class="watercolor-portrait-2" alt="Carlos y Jackie">
          </section>
        </div>

      </div>

      <!-- Modal Lightbox para apreciar las acuarelas en alta resolución -->
      <div class="watercolor-lightbox" id="watercolor-lightbox">
        <div class="watercolor-lightbox-content">
          <button class="watercolor-lightbox-close" id="lightbox-close" aria-label="Cerrar">&times;</button>
          <img src="" alt="Acuarela Carlos y Jackie" class="watercolor-lightbox-img" id="lightbox-img">
          <div class="watercolor-lightbox-caption" id="lightbox-caption">Carlos & Jackie</div>
        </div>
      </div>
    </div>
  `;

  // Start countdown clock
  startCountdown();

  // Attach event handlers
  attachSkillLandingEvents(container, guest);

  // Initialize auto-scroll pasarela controller & start automatic tour + music
  autoScrollController.init(container);
  autoScrollController.startAutoplayTour({ delayMs: 1200 });
}

function startCountdown() {
  const targetDate = new Date('2026-12-26T19:00:00-05:00').getTime();

  function tick() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) return;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const elDays = document.getElementById('cd-days');
    const elHours = document.getElementById('cd-hours');
    const elMinutes = document.getElementById('cd-minutes');
    const elSeconds = document.getElementById('cd-seconds');

    if (elDays) elDays.textContent = String(days).padStart(2, '0');
    if (elHours) elHours.textContent = String(hours).padStart(2, '0');
    if (elMinutes) elMinutes.textContent = String(minutes).padStart(2, '0');
    if (elSeconds) elSeconds.textContent = String(seconds).padStart(2, '0');
  }

  tick();
  countdownInterval = setInterval(tick, 1000);
}

function attachSkillLandingEvents(container, guest) {
  // Mark guest viewed in storage
  storage.markGuestViewed(guest.id);

  // Widget "¡Dale play!"
  const dalePlayWidget = container.querySelector('#btn-dale-play');
  const dalePlayLabel = container.querySelector('#dale-play-label');

  const updateMusicLabel = (playing) => {
    const isNowPlaying = playing !== undefined ? playing : audioEngine.isPlaying;
    if (dalePlayLabel) {
      dalePlayLabel.textContent = isNowPlaying ? (MUSIC_CONFIG.labelPause || 'Pausar música') : (MUSIC_CONFIG.labelPlay || '¡Dale play!');
    }
    if (dalePlayWidget) {
      if (isNowPlaying) {
        dalePlayWidget.classList.add('is-playing');
      } else {
        dalePlayWidget.classList.remove('is-playing');
      }
    }
  };

  // Sincronizar estado inicial y escuchar cambios
  updateMusicLabel(audioEngine.isPlaying);
  audioEngine.onStateChange((playing) => {
    updateMusicLabel(playing);
  });

  dalePlayWidget?.addEventListener('click', () => {
    audioEngine.toggleMusic();
  });

  // Iniciar reproducción automática según configuración y políticas del navegador
  audioEngine.startAutoplayIfConfigured();

  // Calendar Event Button (.ics)
  const calBtn = container.querySelector('#btn-add-cal');
  if (calBtn) {
    calBtn.addEventListener('click', () => {
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Carlos y Jackie//Boda 2026//ES',
        'BEGIN:VEVENT',
        'SUMMARY:Boda Civil & Recepción: Carlos y Jackie 💍',
        'DESCRIPTION:Recepción y celebración de boda civil de Carlos y Jackie en Recepciones Villa Venecia, SJL.',
        'LOCATION:Recepciones Villa Venecia, Av. 13 De Enero 1532, SJL, Lima',
        'DTSTART:20261227T000000Z',
        'DTEND:20261227T100000Z',
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Boda_Carlos_y_Jackie.ics';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Evento agendado en tu calendario.', 'success');
    });
  }

  // Copy Buttons for Bank accounts & Yape
  container.querySelectorAll('.copy-inline-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.copy;
      if (text) {
        navigator.clipboard.writeText(text);
        const originalText = btn.textContent;
        btn.textContent = '¡Copiado!';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
        showToast('Número copiado al portapapeles.', 'success');
      }
    });
  });

  // Toggle RSVP Drawer
  const toggleRsvpBtn = container.querySelector('#btn-toggle-rsvp');
  const drawer = container.querySelector('#editorial-rsvp-drawer');

  toggleRsvpBtn?.addEventListener('click', () => {
    rsvpDrawerOpen = !rsvpDrawerOpen;
    if (drawer) {
      drawer.style.display = rsvpDrawerOpen ? 'block' : 'none';
      if (rsvpDrawerOpen) {
        drawer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  });

  // Radio Buttons: Yes / No
  const optYes = container.querySelector('#radio-opt-yes');
  const optNo = container.querySelector('#radio-opt-no');
  let attendingStatus = guest.status !== 'declinada';

  optYes?.addEventListener('click', () => {
    attendingStatus = true;
    optYes.classList.add('active');
    optNo?.classList.remove('active');
  });

  optNo?.addEventListener('click', () => {
    attendingStatus = false;
    optNo.classList.add('active');
    optYes?.classList.remove('active');
  });

  // Submit RSVP Form
  const rsvpForm = container.querySelector('#editorial-rsvp-form');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();

      storage.confirmGuestRsvp(guest.id, {
        attending: attendingStatus,
        confirmedPasses: attendingStatus ? guest.passes : 0,
        dietaryRestrictions: '',
        songSuggestion: '',
        wishes: ''
      });

      if (attendingStatus) {
        audioEngine.playSuccessChime();
        confetti({
          particleCount: 110,
          spread: 80,
          origin: { y: 0.7 },
          colors: ['#72826c', '#b89146', '#f5f2eb', '#404040']
        });
        showToast('¡Muchas gracias! Tu asistencia ha sido confirmada.', 'success');
      } else {
        showToast('Lamentamos que no puedas asistir. ¡Te mandamos un fuerte abrazo!', 'info');
      }

      // Re-render in open drawer state
      rsvpDrawerOpen = true;
      renderLandingView(container, guest.id);
    });
  }

  // Download PDF Pass
  const dlPdfBtn = container.querySelector('#btn-download-pdf');
  if (dlPdfBtn) {
    dlPdfBtn.addEventListener('click', async () => {
      showToast('Descargando tu pase oficial en PDF...', 'info');
      await downloadGuestPdf(guest);
      showToast('Pase descargado exitosamente.', 'success');
    });
  }

  // Lightbox interactivo para apreciar las acuarelas
  const lightbox = container.querySelector('#watercolor-lightbox');
  const lbImg = container.querySelector('#lightbox-img');
  const lbCaption = container.querySelector('#lightbox-caption');
  const lbClose = container.querySelector('#lightbox-close');

  const openLightbox = (src, caption) => {
    if (!lightbox || !lbImg) return;
    lbImg.src = src;
    if (lbCaption) lbCaption.textContent = caption || 'Carlos & Jackie';
    lightbox.classList.add('active');
  };

  const closeLightbox = () => {
    if (lightbox) lightbox.classList.remove('active');
  };

  lbClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Título e imágenes de acuarela con cursor de visualización
  container.querySelector('.hero-photo')?.addEventListener('click', () => {
    openLightbox('/assets/carlos_jackie_1.jpg', 'Carlos & Jackie — ¡Nos casamos!');
  });
  container.querySelector('.watercolor-portrait-frame img')?.addEventListener('click', () => {
    openLightbox('/assets/carlos_jackie_3_feathered.png', 'Carlos & Jackie — Celebración y Amor');
  });
  container.querySelector('.moments-photo')?.addEventListener('click', () => {
    openLightbox('/assets/carlos_jackie_2_feathered.png', 'Carlos & Jackie — Cada Aventura Juntos');
  });
  container.querySelector('.watercolor-portrait-2')?.addEventListener('click', () => {
    openLightbox('/assets/carlos_jackie_4_feathered.png', 'Carlos & Jackie — ¡Los Esperamos!');
  });
}
