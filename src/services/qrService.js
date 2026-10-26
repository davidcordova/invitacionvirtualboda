import QRCode from 'qrcode';

/**
 * QR Service - Generates high-resolution QR codes for PDF & Web
 */

export async function generateQrDataUrl(text, options = {}) {
  try {
    const defaultOptions = {
      width: 300,
      margin: 1,
      color: {
        dark: '#0F172A', // Navy Charcoal
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H',
      ...options
    };
    return await QRCode.toDataURL(text, defaultOptions);
  } catch (err) {
    console.error('Error generating QR code:', err);
    return null;
  }
}

export function getCheckinUrl(token) {
  const origin = window.location.origin;
  return `${origin}/#checkin?inv=${encodeURIComponent(token)}`;
}

export function getInvitationUrl(token) {
  const origin = window.location.origin;
  return `${origin}/?inv=${encodeURIComponent(token)}`;
}
