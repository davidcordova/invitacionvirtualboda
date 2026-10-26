/**
 * Envelope Service — Generates high-definition personalized Envelope Cards
 * Perfectly dimensioned for A5 Landscape (1680 x 1184 px) with zero character encoding issues
 */

import { generateQrDataUrl, getInvitationUrl, getCheckinUrl } from './qrService.js';
import { generateGuestPdf } from './pdfService.js';

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Renders an ultra-clean, high-definition (1680 x 1184 px, A5 Landscape) envelope card on Canvas
 */
export async function generateGuestEnvelopeCanvas(guest) {
  const canvas = document.createElement('canvas');
  // 1680 x 1184 exactly matches 210mm x 148mm (aspect ratio 1.4189)
  canvas.width = 1680;
  canvas.height = 1184;
  const ctx = canvas.getContext('2d');

  const invitationUrl = getInvitationUrl(guest.id);
  const checkinUrl = getCheckinUrl(guest.id);
  const qrDataUrl = await generateQrDataUrl(invitationUrl, { width: 300, margin: 1 });

  // 1. Luxury Warm Linen / Ivory Background
  ctx.fillStyle = '#faf8f5';
  ctx.fillRect(0, 0, 1680, 1184);

  const bgGrad = ctx.createLinearGradient(0, 0, 1680, 1184);
  bgGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
  bgGrad.addColorStop(1, 'rgba(244, 238, 227, 0.5)');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1680, 1184);

  // 2. Elegant Double Gold Borders (Safe from all edges)
  ctx.strokeStyle = '#c48e33'; // Gold
  ctx.lineWidth = 4;
  ctx.strokeRect(44, 44, 1592, 1096);

  ctx.strokeStyle = 'rgba(196, 142, 51, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(58, 58, 1564, 1068);

  // 3. Header Section (Clean Typography with standard Unicode symbols)
  ctx.textAlign = 'center';
  ctx.fillStyle = '#a87424';
  ctx.font = '600 20px "Montserrat", sans-serif';
  ctx.fillText('✦   N U E S T R A   B O D A   C I V I L   ✦', 840, 130);

  ctx.fillStyle = '#0f172a'; // Deep Navy Slate
  ctx.font = 'bold 54px "Playfair Display", "Times New Roman", serif';
  ctx.fillText('Carlos & Jackie', 840, 195);

  ctx.fillStyle = '#64748b';
  ctx.font = 'italic 22px "Cormorant Garamond", Georgia, serif';
  ctx.fillText('Sábado, 26 de Diciembre de 2026 • Recepciones Villa Venecia (SJL)', 840, 240);

  // 4. Central Envelope with Wax Seal Image
  try {
    const envelopeImg = await loadImage('/assets/sobre_lacre.jpg');
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
    console.warn('Fallback envelope drawing:', err);
    ctx.fillStyle = '#fdfaf5';
    ctx.strokeStyle = '#d8a555';
    ctx.lineWidth = 2;
    roundRect(ctx, 410, 275, 860, 436, 12, true, true);
  }

  // 5. Guest Information Overlay Plaque
  const plaqueW = 720;
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

  // Guest Name inside plaque
  ctx.textAlign = 'center';
  ctx.fillStyle = '#885b18'; // Deep gold
  ctx.font = 'bold italic 34px "Playfair Display", Georgia, serif';
  ctx.fillText(guest.name || 'Invitado Especial', 840, plaqueY + 54);

  // Passes & Table Badge
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 18px "Montserrat", sans-serif';
  const tableClean = guest.table ? (guest.table.toLowerCase().startsWith('mesa') ? guest.table.toUpperCase() : `MESA: ${guest.table.toUpperCase()}`) : 'MESA POR ASIGNAR';
  const passText = `VÁLIDO POR ${guest.passes} PASE${guest.passes > 1 ? 'S' : ''} • ${tableClean}`;
  ctx.fillText(passText, 840, plaqueY + 98);

  // Custom dedication note if present
  if (guest.customNote) {
    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 16px Georgia, serif';
    const note = guest.customNote.length > 65 ? guest.customNote.substring(0, 62) + '...' : guest.customNote;
    ctx.fillText(`"${note}"`, 840, plaqueY + 138);
  } else {
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 15px Georgia, serif';
    ctx.fillText('¡Esperamos contar con su cariño y compañía en este día tan especial!', 840, plaqueY + 138);
  }

  // 6. Interactive CTA Button Banner (Centered, no collision)
  const btnW = 560;
  const btnH = 56;
  const btnX = (1680 - btnW) / 2;
  const btnY = 720;

  ctx.save();
  ctx.fillStyle = '#c48e33';
  roundRect(ctx, btnX, btnY, btnW, btnH, 28, true, false);
  ctx.restore();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 17px "Montserrat", sans-serif';
  ctx.fillText('✉   TOCA AQUÍ PARA ABRIR TU INVITACIÓN VIRTUAL', 840, btnY + 36);

  // 7. QR Code Section (Positioned safely in bottom right quadrant, ample margins)
  if (qrDataUrl) {
    try {
      const qrImg = await loadImage(qrDataUrl);
      const qrBoxW = 200;
      const qrBoxH = 250;
      const qrBoxX = 1390;
      const qrBoxY = 790;
      const qrSize = 160;

      // QR white frame
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      roundRect(ctx, qrBoxX, qrBoxY, qrBoxW, qrBoxH, 10, true, true);

      // Centered QR image
      ctx.drawImage(qrImg, qrBoxX + 20, qrBoxY + 16, qrSize, qrSize);

      ctx.fillStyle = '#334155';
      ctx.font = 'bold 13px "Montserrat", sans-serif';
      ctx.fillText('QR DE ACCESO', qrBoxX + (qrBoxW / 2), qrBoxY + qrSize + 36);

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(guest.id, qrBoxX + (qrBoxW / 2), qrBoxY + qrSize + 56);
    } catch (e) {
      console.warn('QR image load error on canvas:', e);
    }
  }

  // 8. Footer Link & Instructions (Left and Center, fully legible)
  ctx.textAlign = 'center';
  ctx.fillStyle = '#475569';
  ctx.font = '16px "Cormorant Garamond", Georgia, serif';
  ctx.fillText(`Invitación Virtual: ${invitationUrl}`, 780, 830);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'italic 15px Georgia, serif';
  ctx.fillText('Haz clic en el sobre o escanea el QR con tu cámara para ver los detalles y confirmar asistencia.', 780, 862);

  return canvas;
}

/**
 * Generates PNG Image Blob from Canvas
 */
export async function generateGuestEnvelopeBlob(guest) {
  const canvas = await generateGuestEnvelopeCanvas(guest);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', 0.95);
  });
}

/**
 * Generates PNG Image File object (for Web Share API)
 */
export async function generateGuestEnvelopeFile(guest) {
  const blob = await generateGuestEnvelopeBlob(guest);
  const cleanName = (guest.name || 'Invitado').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/g, '_');
  return new File([blob], `Sobre_Invitacion_${cleanName}_${guest.id}.png`, { type: 'image/png' });
}

/**
 * Generates Interactive PDF File object (for Web Share API)
 */
export async function generateGuestPdfFile(guest) {
  const doc = await generateGuestPdf(guest);
  const pdfBlob = doc.output('blob');
  const cleanName = (guest.name || 'Invitado').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/g, '_');
  return new File([pdfBlob], `Invitacion_Boda_${cleanName}_${guest.id}.pdf`, { type: 'application/pdf' });
}

/**
 * Copies the Envelope PNG directly to the user's system Clipboard
 */
export async function copyEnvelopeImageToClipboard(guest) {
  try {
    const blob = await generateGuestEnvelopeBlob(guest);
    if (navigator.clipboard && window.ClipboardItem) {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Clipboard write failed:', err);
    return false;
  }
}

/**
 * Helper to draw rounded rectangle on canvas
 */
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
