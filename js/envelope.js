/**
 * Envelope & Clickable PDF Generator — Carlos & Jackie Wedding (MVP PHP)
 * Generates high-definition A5 Landscape (1680 x 1184 px) digital envelope
 * with embedded hyperlink and QR code pointing to the live wedding invitation.
 */

(function () {
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  }

  function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  async function generateQrDataUrl(text, options = {}) {
    if (!window.QRCode || typeof window.QRCode.toDataURL !== 'function') {
      return null;
    }
    try {
      const defaultOptions = {
        width: 300,
        margin: 1,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H',
        ...options
      };
      return await window.QRCode.toDataURL(text, defaultOptions);
    } catch (err) {
      console.warn('Error generating QR code:', err);
      return null;
    }
  }

  function getDefaultEnvelopeData(overrides = {}) {
    const cfg = window.WEDDING_CONFIG || {};
    const defaultUrl = cfg.invitation_url || 'https://alphastudio.net.pe/invitacion';
    return {
      coupleNames: cfg.couple_names || 'Carlos & Jackie',
      title: overrides.title || cfg.generic_guest_title || 'Familia & Amigos',
      subtitle: overrides.subtitle || 'BODA CIVIL & RECEPCIÓN • 26 DE DICIEMBRE DE 2026',
      note: overrides.note || cfg.generic_pass_note || '¡Será un gran honor contar con su grata presencia en este día tan especial!',
      invitationUrl: overrides.invitationUrl || defaultUrl
    };
  }

  async function generateEnvelopeCanvas(overrides = {}) {
    const data = getDefaultEnvelopeData(overrides);
    const canvas = document.createElement('canvas');
    // 1680 x 1184 matches A5 Landscape (210mm x 148mm) at high resolution
    canvas.width = 1680;
    canvas.height = 1184;
    const ctx = canvas.getContext('2d');

    const qrDataUrl = await generateQrDataUrl(data.invitationUrl, { width: 300, margin: 1 });

    // 1. Luxury Warm Linen / Ivory Background
    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0, 0, 1680, 1184);

    const bgGrad = ctx.createLinearGradient(0, 0, 1680, 1184);
    bgGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    bgGrad.addColorStop(1, 'rgba(244, 238, 227, 0.5)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1680, 1184);

    // 2. Elegant Double Gold Borders
    ctx.strokeStyle = '#c48e33';
    ctx.lineWidth = 4;
    ctx.strokeRect(44, 44, 1592, 1096);

    ctx.strokeStyle = 'rgba(196, 142, 51, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(58, 58, 1564, 1068);

    // 3. Header Section
    ctx.textAlign = 'center';
    ctx.fillStyle = '#a87424';
    ctx.font = '600 20px "Montserrat", sans-serif';
    ctx.fillText('✦   N U E S T R A   B O D A   C I V I L   ✦', 840, 130);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 54px "Playfair Display", "Times New Roman", serif';
    ctx.fillText(data.coupleNames, 840, 195);

    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 22px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('Sábado, 26 de Diciembre de 2026 • Recepciones Villa Venecia (SJL)', 840, 240);

    // 4. Central Envelope with Wax Seal Image
    try {
      const envelopeImg = await loadImage('assets/sobre_lacre.jpg');
      const envW = 860;
      const envH = 436;
      const envX = (1680 - envW) / 2;
      const envY = 275;

      ctx.save();
      ctx.shadowColor = 'rgba(15, 23, 42, 0.18)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 10;
      ctx.drawImage(envelopeImg, envX, envY, envW, envH);
      ctx.restore();
    } catch (err) {
      ctx.fillStyle = '#fdfaf5';
      ctx.strokeStyle = '#d8a555';
      ctx.lineWidth = 2;
      roundRect(ctx, 410, 275, 860, 436, 12, true, true);
    }

    // 5. Generic Invitation Plaque Overlay
    const plaqueW = 740;
    const plaqueH = 175;
    const plaqueX = (1680 - plaqueW) / 2;
    const plaqueY = 485;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.14)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#c48e33';
    ctx.lineWidth = 2.5;
    roundRect(ctx, plaqueX, plaqueY, plaqueW, plaqueH, 10, true, true);
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#885b18';
    ctx.font = 'bold italic 34px "Playfair Display", Georgia, serif';
    ctx.fillText(data.title, 840, plaqueY + 54);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 17px "Montserrat", sans-serif';
    ctx.fillText(data.subtitle.toUpperCase(), 840, plaqueY + 98);

    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 16px Georgia, serif';
    const cleanNote = data.note.length > 72 ? data.note.substring(0, 69) + '...' : data.note;
    ctx.fillText(`"${cleanNote}"`, 840, plaqueY + 138);

    // 6. Interactive CTA Button Banner
    const btnW = 580;
    const btnH = 56;
    const btnX = (1680 - btnW) / 2;
    const btnY = 720;

    ctx.save();
    ctx.fillStyle = '#c48e33';
    roundRect(ctx, btnX, btnY, btnW, btnH, 28, true, false);
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 17px "Montserrat", sans-serif';
    ctx.fillText('✉   TOCA AQUÍ PARA ABRIR LA INVITACIÓN VIRTUAL', 840, btnY + 36);

    // 7. QR Code Section (Bottom Right)
    if (qrDataUrl) {
      try {
        const qrImg = await loadImage(qrDataUrl);
        const qrBoxW = 200;
        const qrBoxH = 245;
        const qrBoxX = 1390;
        const qrBoxY = 790;
        const qrSize = 160;

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        roundRect(ctx, qrBoxX, qrBoxY, qrBoxW, qrBoxH, 10, true, true);

        ctx.drawImage(qrImg, qrBoxX + 20, qrBoxY + 16, qrSize, qrSize);

        ctx.fillStyle = '#334155';
        ctx.font = 'bold 13px "Montserrat", sans-serif';
        ctx.fillText('QR INVITACIÓN', qrBoxX + (qrBoxW / 2), qrBoxY + qrSize + 36);

        ctx.fillStyle = '#885b18';
        ctx.font = 'bold 11px "Montserrat", sans-serif';
        ctx.fillText('ESCANÉAME', qrBoxX + (qrBoxW / 2), qrBoxY + qrSize + 55);
      } catch (e) {}
    }

    // 8. Footer Link & Instructions
    ctx.textAlign = 'center';
    ctx.fillStyle = '#475569';
    ctx.font = '16px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(`Invitación Virtual: ${data.invitationUrl}`, 780, 830);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 15px Georgia, serif';
    ctx.fillText('Haz clic en el sobre o escanea el QR con tu cámara para ver los detalles y confirmar asistencia.', 780, 862);

    return { canvas, data };
  }

  async function downloadEnvelopePdf(overrides = {}) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error('Librería jsPDF no cargada');
    }
    const { jsPDF } = window.jspdf;
    const { canvas, data } = await generateEnvelopeCanvas(overrides);
    const canvasDataUrl = canvas.toDataURL('image/jpeg', 0.95);

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [210, 148]
    });

    doc.addImage(canvasDataUrl, 'JPEG', 0, 0, 210, 148, undefined, 'FAST');
    // Hyperlink across the entire A5 card so clicking anywhere opens the invitation
    doc.link(0, 0, 210, 148, { url: data.invitationUrl });

    doc.save('Sobre_Invitacion_Carlos_y_Jackie.pdf');
    return doc;
  }

  async function downloadEnvelopePng(overrides = {}) {
    const { canvas } = await generateEnvelopeCanvas(overrides);
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'Sobre_Invitacion_Carlos_y_Jackie.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function copyEnvelopeToClipboard(overrides = {}) {
    const { canvas } = await generateEnvelopeCanvas(overrides);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.95));
    if (navigator.clipboard && window.ClipboardItem) {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      return true;
    }
    return false;
  }

  window.envelopeService = {
    generateEnvelopeCanvas,
    downloadEnvelopePdf,
    downloadEnvelopePng,
    copyEnvelopeToClipboard
  };
})();

