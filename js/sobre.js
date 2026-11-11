/**
 * Dedicated Digital Envelope Page Controller (sobre.php) — Carlos & Jackie Wedding
 */

document.addEventListener('DOMContentLoaded', () => {
  const mount = document.getElementById('sobre-canvas-mount');
  const titleInput = document.getElementById('sobre-title-input');
  const noteInput = document.getElementById('sobre-note-input');
  const urlInput = document.getElementById('sobre-url-input');

  const btnPdf = document.getElementById('btn-sobre-pdf');
  const btnPng = document.getElementById('btn-sobre-png');
  const btnCopy = document.getElementById('btn-sobre-copy');
  const btnWa = document.getElementById('btn-sobre-whatsapp');

  function getCurrentOverrides() {
    return {
      title: (titleInput?.value || '').trim() || 'Familia & Amigos',
      note: (noteInput?.value || '').trim() || '¡Será un gran honor contar con su grata presencia en este día tan especial!',
      invitationUrl: (urlInput?.value || '').trim() || undefined
    };
  }

  let renderTimeout = null;
  async function renderPreview() {
    if (!mount || !window.envelopeService) return;
    try {
      const { canvas } = await window.envelopeService.generateEnvelopeCanvas(getCurrentOverrides());
      mount.innerHTML = '';
      mount.appendChild(canvas);
    } catch (err) {
      console.error('Error rendering envelope preview:', err);
    }
  }

  function scheduleRender() {
    clearTimeout(renderTimeout);
    renderTimeout = setTimeout(renderPreview, 200);
  }

  titleInput?.addEventListener('input', scheduleRender);
  noteInput?.addEventListener('input', scheduleRender);
  urlInput?.addEventListener('input', scheduleRender);

  // Initial render (and re-render once fonts finish loading)
  renderPreview();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(renderPreview);
  }

  btnPdf?.addEventListener('click', async () => {
    const originalText = btnPdf.textContent;
    try {
      btnPdf.disabled = true;
      btnPdf.textContent = '⏳ Generando PDF con Link...';
      await window.envelopeService.downloadEnvelopePdf(getCurrentOverrides());
      window.showToast?.('Sobre PDF con link interactivo descargado.', 'success');
    } catch (err) {
      console.error(err);
      window.showToast?.('Error al generar el PDF.', 'error');
    } finally {
      btnPdf.disabled = false;
      btnPdf.textContent = originalText;
    }
  });

  btnPng?.addEventListener('click', async () => {
    try {
      await window.envelopeService.downloadEnvelopePng(getCurrentOverrides());
      window.showToast?.('Imagen PNG del sobre descargada.', 'success');
    } catch (err) {
      window.showToast?.('Error al descargar imagen PNG.', 'error');
    }
  });

  btnCopy?.addEventListener('click', async () => {
    try {
      const ok = await window.envelopeService.copyEnvelopeToClipboard(getCurrentOverrides());
      if (ok) {
        window.showToast?.('Sobre copiado al portapapeles. ¡Pégalo en WhatsApp!', 'success');
      } else {
        window.showToast?.('Tu navegador no soporta copiado directo; usa Descargar PNG o PDF.', 'warning');
      }
    } catch (err) {
      window.showToast?.('Error al copiar al portapapeles.', 'error');
    }
  });

  btnWa?.addEventListener('click', () => {
    const overrides = getCurrentOverrides();
    const cfg = window.WEDDING_CONFIG || {};
    const invUrl = overrides.invitationUrl || cfg.invitation_url || 'https://alphastudio.net.pe/invitacion';
    const msg = [
      `💍 *¡Nos Casamos! — ${cfg.couple_names || 'Carlos & Jackie'}*`,
      ``,
      `Con mucha alegría queremos invitarte a celebrar nuestra Boda Civil y Recepción el *Sábado 26 de Diciembre de 2026* en *Recepciones Villa Venecia (SJL)*.`,
      ``,
      `✨ *Abre tu invitación virtual aquí:*`,
      invUrl
    ].join('\n');

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  });
});

