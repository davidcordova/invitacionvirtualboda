/**
 * Main Landing Page Controller — Carlos & Jackie Wedding (MVP PHP)
 */

document.addEventListener('DOMContentLoaded', () => {
  const cfg = window.WEDDING_CONFIG || {};
  const audioEngine = window.audioEngine;

  // 1. Real-time Countdown Timer
  const targetDateStr = cfg.event_iso_countdown || '2026-12-26T19:00:00-05:00';
  const targetTime = new Date(targetDateStr).getTime();

  function updateCountdown() {
    const now = Date.now();
    const distance = targetTime - now;
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

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // 2. Music "¡Dale play!" Widget
  const dalePlayWidget = document.getElementById('btn-dale-play');
  const dalePlayLabel = document.getElementById('dale-play-label');
  const musicCfg = cfg.music || {};

  function updateMusicUi(playing) {
    const isNowPlaying = playing !== undefined ? playing : (audioEngine && audioEngine.isPlaying);
    if (dalePlayLabel) {
      dalePlayLabel.textContent = isNowPlaying
        ? (musicCfg.labelPause || 'Pausar música')
        : (musicCfg.labelPlay || '¡Dale play!');
    }
    if (dalePlayWidget) {
      dalePlayWidget.classList.toggle('is-playing', Boolean(isNowPlaying));
    }
  }

  if (audioEngine) {
    updateMusicUi(audioEngine.isPlaying);
    audioEngine.onStateChange(playing => updateMusicUi(playing));
  }

  dalePlayWidget?.addEventListener('click', () => {
    audioEngine?.toggleMusic();
  });

  // 3. Copy Bank Accounts / Yape Buttons
  document.querySelectorAll('.copy-inline-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.copy;
      if (text && navigator.clipboard) {
        navigator.clipboard.writeText(text);
        const originalText = btn.textContent;
        btn.textContent = '¡Copiado!';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
        window.showToast?.('Número copiado al portapapeles.', 'success');
      }
    });
  });

  // 4. Direct WhatsApp Confirmation to Bride (+51 977 800 311) with Confetti
  const directRsvpBtn = document.getElementById('btn-direct-rsvp-wa');
  directRsvpBtn?.addEventListener('click', () => {
    audioEngine?.playSuccessChime();
    if (typeof window.confetti === 'function') {
      window.confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#72826c', '#b89146', '#f5f2eb', '#404040']
      });
    }
    window.showToast?.('¡Muchas gracias! Abriendo WhatsApp para enviar tu confirmación...', 'success');
  });

  // 5. Direct Download of Generic Envelope PDF from Landing Page
  const dlEnvelopePdfBtn = document.getElementById('btn-download-envelope-pdf');
  dlEnvelopePdfBtn?.addEventListener('click', async () => {
    const originalText = dlEnvelopePdfBtn.textContent;
    try {
      dlEnvelopePdfBtn.disabled = true;
      dlEnvelopePdfBtn.textContent = 'GENERANDO PDF...';
      window.showToast?.('Generando el sobre digital en PDF con link interactivo...', 'info');
      await window.envelopeService.downloadEnvelopePdf();
      window.showToast?.('Sobre PDF descargado exitosamente.', 'success');
    } catch (err) {
      console.error(err);
      window.showToast?.('Ocurrió un error al generar el PDF.', 'error');
    } finally {
      dlEnvelopePdfBtn.disabled = false;
      dlEnvelopePdfBtn.textContent = originalText;
    }
  });

  // 6. Watercolor Lightbox
  const lightbox = document.getElementById('watercolor-lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbCaption = document.getElementById('lightbox-caption');
  const lbClose = document.getElementById('lightbox-close');

  function openLightbox(src, caption) {
    if (!lightbox || !lbImg) return;
    lbImg.src = src;
    if (lbCaption) lbCaption.textContent = caption || 'Carlos & Jackie';
    lightbox.classList.add('active');
  }

  function closeLightbox() {
    lightbox?.classList.remove('active');
  }

  lbClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Cualquier foto pegada con atributo data-lightbox se abre en el visor a pantalla completa
  document.querySelectorAll('.pasted-photo-card[data-lightbox]').forEach(card => {
    card.addEventListener('click', () => {
      const src = card.getAttribute('data-lightbox');
      const caption = card.getAttribute('data-caption') || 'Carlos & Jackie';
      if (src) openLightbox(src, caption);
    });
  });

  // 7. Iniciar música automáticamente al cargar (o al primer toque/deslizamiento del usuario)
  if (audioEngine) {
    audioEngine.play().then(started => {
      if (!started) {
        audioEngine.armAutoplayOnFirstGesture();
      }
    }).catch(() => {
      audioEngine.armAutoplayOnFirstGesture();
    });
  }
});

