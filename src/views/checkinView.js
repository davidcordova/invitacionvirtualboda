/**
 * Staff Check-in QR Scanner & Verification View
 */

import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { storage } from '../services/storage.js';
import { authService } from '../services/authService.js';
import { audioEngine } from '../utils/audio.js';
import { showToast } from '../utils/toast.js';

let html5QrCode = null;
let isScannerRunning = false;
let currentVerifiedGuest = null;
let passesToAdmit = 1;

export function renderCheckinView(container, initialToken = null) {
  // Clean up any running scanner instance
  stopScanner();

  const user = authService.getCurrentUser() || {
    username: 'porteria',
    role: 'porteria',
    displayName: 'Control de Puerta',
    badge: '🛡️ Portería'
  };
  const isPorteria = authService.isPorteria();

  // If initial token passed via URL
  if (initialToken) {
    currentVerifiedGuest = storage.getGuestById(initialToken);
  }

  container.innerHTML = `
    <div class="admin-layout">
      <!-- Top Navigation Bar -->
      <nav class="admin-navbar">
        <div class="admin-navbar-inner">
          <div class="admin-brand">
            <div class="admin-brand-icon">📷</div>
            <div class="admin-brand-text">
              <h1>Escáner QR & Check-in de Puerta</h1>
              <p>Recepciones Villa Venecia (SJL) • Boda Carlos & Jackie</p>
            </div>
          </div>

          <!-- Navigation Links -->
          <div class="admin-nav-tabs">
            <a href="#admin" class="admin-nav-link">
              ← Volver a Lista de Invitados
            </a>
            <a href="#checkin" class="admin-nav-link active">
              📷 Escáner QR
            </a>
          </div>

          <!-- User Profile & Logout -->
          <div class="admin-user-profile">
            <span class="role-badge ${isPorteria ? 'role-badge-porteria' : 'role-badge-admin'}">
              ${user.badge || (isPorteria ? '🛡️ Portería' : '👑 Administrador')}
            </span>
            <span style="font-size: 0.85rem; font-weight: 600; color: var(--admin-text-main);">
              ${user.displayName}
            </span>
            <a href="#logout" class="btn-logout" title="Cerrar sesión">
              🚪 Salir
            </a>
          </div>
        </div>
      </nav>

      <!-- Checkin Content Body -->
      <div class="checkin-layout" style="margin-top: 1.5rem;">
        <!-- Scanner Stage -->
        <div class="scanner-container">
          <div class="scanner-viewport-box">
            <div id="qr-reader"></div>
            <div class="scanner-overlay" id="scanner-reticle-overlay">
              <div class="scanner-reticle">
                <div class="scanner-laser-line"></div>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin-bottom: 1.5rem;">
            <button id="btn-toggle-camera" class="btn-admin btn-admin-primary" style="padding: 0.75rem 1.5rem; font-size: 1rem;">
              📷 Iniciar Cámara para Escanear
            </button>
          </div>

          <!-- Manual Token Entry Row -->
          <div class="scanner-manual-row">
            <input type="text" id="input-manual-token" class="admin-search-input" 
              placeholder="Ingresar código manual (ej. INV-8F3A)..." 
              value="${initialToken || ''}" style="text-transform: uppercase;">
            <button id="btn-manual-verify" class="btn-admin btn-admin-secondary">
              Verificar
            </button>
          </div>

          <!-- Quick Simulation Shortcuts for instant testing -->
          <div style="margin-top: 1.5rem; text-align: center; font-size: 0.82rem; color: var(--admin-text-muted);">
            Simular escaneo rápido con invitados de demostración:
            <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; margin-top: 0.5rem;">
              ${storage.getGuests().slice(0, 4).map(g => `
                <button class="btn-admin btn-admin-secondary quick-sim-btn" data-token="${g.id}" style="padding: 0.35rem 0.65rem; font-size: 0.8rem;">
                  ${g.name.split(' ')[0]} (${g.id})
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Verification Result Mount -->
        <div id="verification-result-mount">
          ${renderVerificationCardHtml(currentVerifiedGuest)}
        </div>
      </div>
    </div>
  `;

  attachCheckinEvents(container);

  if (initialToken && currentVerifiedGuest) {
    audioEngine.playSuccessChime();
  }
}

function renderVerificationCardHtml(guest) {
  if (!guest) {
    return `
      <div style="text-align: center; padding: 2rem; color: var(--color-slate-400); font-size: 0.9rem;">
        👆 Escanea un código QR o ingresa un código para verificar el pase del invitado.
      </div>
    `;
  }

  const maxPasses = guest.passes || 1;
  const attended = guest.attendedPasses || 0;
  const remainingPasses = Math.max(0, maxPasses - attended);

  let statusClass = 'status-valid';
  let statusIcon = '✅';
  let statusTitle = 'PASE VÁLIDO — ACCESO AUTORIZADO';
  let statusMessage = 'Invitado registrado oficialmente en la lista de Carlos & Jackie.';

  if (remainingPasses === 0) {
    statusClass = 'status-warning';
    statusIcon = '⚠️';
    statusTitle = 'TODOS LOS PASES YA INGRESARON';
    statusMessage = 'Todos los cupos asignados a este grupo ya fueron registrados previamente.';
  } else if (guest.status === 'declinada') {
    statusClass = 'status-warning';
    statusIcon = '⚠️';
    statusTitle = 'INVITACIÓN MARCADA COMO DECLINADA';
    statusMessage = 'El invitado reportó previamente que no asistiría.';
  }

  passesToAdmit = Math.max(1, Math.min(1, remainingPasses));

  return `
    <div class="verification-card ${statusClass}">
      <div class="verification-card-header">
        <span class="verif-icon">${statusIcon}</span>
        <div class="verif-title-group">
          <h3>${statusTitle}</h3>
          <p>${statusMessage}</p>
        </div>
      </div>

      <div class="verification-card-body">
        <div class="verif-guest-highlight">${guest.name}</div>
        <span class="guest-token-code" style="font-size: 0.9rem;">${guest.id}</span>

        <div class="verif-grid-info">
          <div class="verif-info-item">
            <span class="verif-item-label">Mesa Asignada</span>
            <span class="verif-item-value" style="color: var(--admin-primary); font-weight: 700;">${guest.table || 'Por asignar'}</span>
          </div>

          <div class="verif-info-item">
            <span class="verif-item-label">Pases Totales</span>
            <span class="verif-item-value">${guest.passes}</span>
          </div>

          <div class="verif-info-item">
            <span class="verif-item-label">Pases Confirmados</span>
            <span class="verif-item-value">${guest.confirmedPasses || 0}</span>
          </div>

          <div class="verif-info-item">
            <span class="verif-item-label">Pases en Sala</span>
            <span class="verif-item-value" style="color: #0284C7;">${attended}</span>
          </div>
        </div>

        <!-- Mesa Asignada Destacada para Portería -->
        <div style="background: #e0f2fe; border: 2px solid #38bdf8; border-radius: 8px; padding: 0.85rem; margin: 1rem 0; text-align: center;">
          <div style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: #0369a1; letter-spacing: 0.05em;">
            Mesa Asignada para esta Familia
          </div>
          <div style="font-size: 1.6rem; font-weight: 800; color: #0c4a6e; margin-top: 0.2rem;">
            🍽️ ${guest.table || 'Sin mesa asignada'}
          </div>
        </div>

        ${guest.dietaryRestrictions ? `
          <div style="background: #FFF1F2; border-left: 4px solid #F43F5E; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.85rem; color: #9F1239; margin-bottom: 1rem;">
            🥗 <strong>Restricciones Alimentarias:</strong> ${guest.dietaryRestrictions}
          </div>
        ` : ''}

        ${guest.customNote ? `
          <div style="font-style: italic; font-size: 0.85rem; color: var(--admin-text-muted); margin-bottom: 1rem;">
            Nota de novios: "${guest.customNote}"
          </div>
        ` : ''}

        <!-- Check-in Action Area -->
        <div class="checkin-action-area">
          ${remainingPasses > 0 ? `
            <div class="passes-selector-row">
              <span style="font-weight: 600; font-size: 0.9rem; color: var(--admin-text-main);">
                ¿Cuántos pases ingresan ahora?
              </span>
              <div class="passes-stepper">
                <button type="button" class="stepper-btn" id="btn-stepper-minus" ${passesToAdmit <= 1 ? 'disabled' : ''}>-</button>
                <div class="stepper-value" id="stepper-val-display">${passesToAdmit}</div>
                <button type="button" class="stepper-btn" id="btn-stepper-plus" ${passesToAdmit >= remainingPasses ? 'disabled' : ''}>+</button>
              </div>
            </div>

            <button id="btn-confirm-checkin" class="btn-admin btn-admin-success" style="width: 100%; padding: 0.85rem; font-size: 1rem; justify-content: center;">
              🎉 Registrar Ingreso de <span id="btn-admit-count">${passesToAdmit}</span> Persona${passesToAdmit > 1 ? 's' : ''}
            </button>
          ` : `
            <div style="text-align: center; color: var(--admin-success-text); font-size: 0.95rem; font-weight: 600; background: var(--admin-success-light); border: 1px solid var(--admin-success-border); padding: 0.85rem; border-radius: 8px;">
              ✨ Grupo completo en el evento (${attended} de ${maxPasses} pases registrados)
            </div>
          `}

          <div style="display: flex; justify-content: space-between; margin-top: 0.85rem; gap: 0.5rem;">
            <button id="btn-clear-verif" class="btn-admin btn-admin-secondary" style="font-size: 0.82rem;">
              Limpiar y Escanear Siguiente
            </button>
            <a href="#admin" class="btn-admin btn-admin-secondary" style="font-size: 0.82rem; text-decoration: none;">
              Ver en Lista 📋
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

function attachCheckinEvents(container) {
  // Manual Verification Input
  const inputManual = container.querySelector('#input-manual-token');
  const btnVerify = container.querySelector('#btn-manual-verify');

  const handleManualSearch = () => {
    let raw = inputManual.value.trim();
    if (!raw) {
      showToast('Ingresa un código de invitado.', 'warning');
      return;
    }

    // If full URL was pasted e.g. #checkin?inv=INV-8F3A
    if (raw.includes('inv=')) {
      const match = raw.match(/inv=([A-Za-z0-9_-]+)/);
      if (match) raw = match[1];
    }

    verifyToken(raw);
  };

  btnVerify?.addEventListener('click', handleManualSearch);
  inputManual?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleManualSearch();
  });

  // Quick simulation buttons
  container.querySelectorAll('.quick-sim-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      verifyToken(btn.dataset.token);
    });
  });

  // Toggle Camera Scanner Button
  const btnToggleCamera = container.querySelector('#btn-toggle-camera');
  btnToggleCamera?.addEventListener('click', () => {
    if (isScannerRunning) {
      stopScanner();
      btnToggleCamera.textContent = '📷 Iniciar Cámara para Escanear';
      btnToggleCamera.classList.remove('btn-secondary');
      btnToggleCamera.classList.add('btn-primary');
    } else {
      startScanner(container);
      btnToggleCamera.textContent = '⏹️ Detener Cámara';
      btnToggleCamera.classList.remove('btn-primary');
      btnToggleCamera.classList.add('btn-secondary');
    }
  });

  // Verification Card Actions
  attachCardActionEvents(container);
}

function attachCardActionEvents(container) {
  const mount = container.querySelector('#verification-result-mount');
  if (!mount) return;

  const btnMinus = mount.querySelector('#btn-stepper-minus');
  const btnPlus = mount.querySelector('#btn-stepper-plus');
  const displayVal = mount.querySelector('#stepper-val-display');
  const btnCountSpan = mount.querySelector('#btn-admit-count');
  const btnConfirm = mount.querySelector('#btn-confirm-checkin');
  const btnClear = mount.querySelector('#btn-clear-verif');
  const btnAdmin = mount.querySelector('#btn-view-in-admin');

  if (currentVerifiedGuest) {
    const remaining = Math.max(0, currentVerifiedGuest.passes - (currentVerifiedGuest.attendedPasses || 0));

    btnMinus?.addEventListener('click', () => {
      if (passesToAdmit > 1) {
        passesToAdmit--;
        if (displayVal) displayVal.textContent = passesToAdmit;
        if (btnCountSpan) btnCountSpan.textContent = passesToAdmit;
        if (btnMinus) btnMinus.disabled = passesToAdmit <= 1;
        if (btnPlus) btnPlus.disabled = passesToAdmit >= remaining;
      }
    });

    btnPlus?.addEventListener('click', () => {
      if (passesToAdmit < remaining) {
        passesToAdmit++;
        if (displayVal) displayVal.textContent = passesToAdmit;
        if (btnCountSpan) btnCountSpan.textContent = passesToAdmit;
        if (btnMinus) btnMinus.disabled = passesToAdmit <= 1;
        if (btnPlus) btnPlus.disabled = passesToAdmit >= remaining;
      }
    });

    btnConfirm?.addEventListener('click', () => {
      const result = storage.checkinGuest(currentVerifiedGuest.id, passesToAdmit);
      if (result.success) {
        audioEngine.playSuccessChime();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#10B981', '#C48E33', '#0F172A']
        });
        showToast(`¡Ingreso de ${passesToAdmit} persona(s) registrado para ${currentVerifiedGuest.name}!`, 'success');
        currentVerifiedGuest = result.guest;
        mount.innerHTML = renderVerificationCardHtml(currentVerifiedGuest);
        attachCardActionEvents(container);
      }
    });
  }

  btnClear?.addEventListener('click', () => {
    currentVerifiedGuest = null;
    mount.innerHTML = renderVerificationCardHtml(null);
  });

  btnAdmin?.addEventListener('click', () => {
    window.location.hash = `#admin?highlight=${encodeURIComponent(btnAdmin.dataset.token)}`;
  });
}

function verifyToken(token) {
  const guest = storage.getGuestById(token);
  const mount = document.getElementById('verification-result-mount');

  if (!guest) {
    audioEngine.playWarningBeep();
    currentVerifiedGuest = null;
    if (mount) {
      mount.innerHTML = `
        <div class="verification-card status-invalid">
          <div class="verification-card-header">
            <span class="verif-icon">❌</span>
            <div class="verif-title-group">
              <h3>CÓDIGO NO VÁLIDO / NO REGISTRADO</h3>
              <p>El token "${token}" no existe en la base de datos de invitados.</p>
            </div>
          </div>
          <div class="verification-card-body" style="text-align: center;">
            <p style="color: var(--color-slate-600); font-size: 0.9rem; margin-bottom: 1rem;">
              Verifica si el código fue escrito correctamente o búscalo manualmente en el panel de novios.
            </p>
            <button id="btn-clear-invalid" class="btn btn-outline btn-sm">Reintentar</button>
          </div>
        </div>
      `;
      document.getElementById('btn-clear-invalid')?.addEventListener('click', () => {
        mount.innerHTML = renderVerificationCardHtml(null);
      });
    }
    showToast(`Token "${token}" no encontrado.`, 'error');
    return;
  }

  currentVerifiedGuest = guest;
  audioEngine.playSuccessChime();
  if (mount) {
    mount.innerHTML = renderVerificationCardHtml(currentVerifiedGuest);
    const container = document.querySelector('.checkin-layout');
    if (container) attachCardActionEvents(container);
    mount.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

async function startScanner(container) {
  const qrReaderEl = document.getElementById('qr-reader');
  if (!qrReaderEl) return;

  try {
    html5QrCode = new Html5Qrcode('qr-reader');
    isScannerRunning = true;

    await html5QrCode.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 220, height: 220 }
      },
      (decodedText) => {
        // Successfully scanned
        let token = decodedText.trim();
        if (token.includes('inv=')) {
          const match = token.match(/inv=([A-Za-z0-9_-]+)/);
          if (match) token = match[1];
        }
        verifyToken(token);
      },
      () => {
        // Frame scan error - ignore to keep scanning
      }
    );
  } catch (err) {
    console.error('Camera access error:', err);
    isScannerRunning = false;
    showToast('No se pudo acceder a la cámara. Usa la verificación manual.', 'warning');
    const btn = document.getElementById('btn-toggle-camera');
    if (btn) {
      btn.textContent = '📷 Iniciar Cámara para Escanear';
      btn.classList.add('btn-primary');
      btn.classList.remove('btn-secondary');
    }
  }
}

export function stopScanner() {
  if (html5QrCode && isScannerRunning) {
    try {
      html5QrCode.stop().then(() => {
        html5QrCode.clear();
        html5QrCode = null;
        isScannerRunning = false;
      }).catch((e) => console.warn(e));
    } catch (e) {
      console.warn(e);
    }
  }
}
