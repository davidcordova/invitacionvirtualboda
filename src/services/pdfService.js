import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getInvitationUrl } from './qrService.js';
import { generateGuestEnvelopeCanvas } from './envelopeService.js';

/**
 * PDF Service — Generates high-definition, clickable invitation cards
 * Uses high-resolution HTML5 canvas rendering to ensure 100% flawless typography,
 * zero encoding bugs, perfect element alignment, and active hyperlinks.
 */

export async function generateGuestPdf(guest) {
  // A5 Landscape: 210mm x 148mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [210, 148]
  });

  const invitationUrl = getInvitationUrl(guest.id);

  // Generate the ultra-sharp, perfectly dimensioned canvas (1680 x 1184 px)
  const canvas = await generateGuestEnvelopeCanvas(guest);
  const canvasDataUrl = canvas.toDataURL('image/jpeg', 0.95);

  // Render canvas directly into the PDF spanning the full A5 page
  doc.addImage(canvasDataUrl, 'JPEG', 0, 0, 210, 148, undefined, 'FAST');

  // Add clickable hyperlink spanning the card:
  // Tapping anywhere on the envelope or button in any PDF reader directly opens the invitation!
  doc.link(0, 0, 210, 148, { url: invitationUrl });

  return doc;
}

export async function downloadGuestPdf(guest) {
  const doc = await generateGuestPdf(guest);
  const cleanName = (guest.name || 'Invitado').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/g, '_');
  doc.save(`Invitacion_${cleanName}_${guest.id}.pdf`);
}

export async function generatePdfBlobUrl(guest) {
  const doc = await generateGuestPdf(guest);
  return doc.output('bloburl');
}

export async function downloadAllGuestsZip(guests, onProgress) {
  const zip = new JSZip();
  const folder = zip.folder('Invitaciones_Boda_Carlos_y_Jackie');

  for (let i = 0; i < guests.length; i++) {
    const guest = guests[i];
    if (onProgress) {
      onProgress(i + 1, guests.length, guest.name);
    }
    const doc = await generateGuestPdf(guest);
    const pdfBlob = doc.output('blob');
    const cleanName = (guest.name || 'Invitado').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/g, '_');
    folder.file(`Invitacion_${cleanName}_${guest.id}.pdf`, pdfBlob);
  }

  const zipContent = await zip.generateAsync({ type: 'blob' });
  saveAs(zipContent, 'Invitaciones_Boda_Carlos_y_Jackie.zip');
}
