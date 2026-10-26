/**
 * Control Panel & Reception Backoffice View — Carlos & Jackie Wedding
 * Prioritizes high clarity, SaaS UX/UI best practices, and Role-Based Access (Admin vs. Portería)
 */

import { storage } from '../services/storage.js';
import { authService } from '../services/authService.js';
import { downloadGuestPdf, downloadAllGuestsZip } from '../services/pdfService.js';
import { downloadExcelTemplate, parseExcelOrCsvFile, exportGuestsToExcel } from '../services/excelService.js';
import { getInvitationUrl } from '../services/qrService.js';
import { showToast } from '../utils/toast.js';
import { showModal, closeModal } from '../utils/modal.js';
import { audioEngine } from '../utils/audio.js';
import { audioStorage } from '../services/audioStorage.js';
import {
  generateGuestEnvelopeCanvas,
  generateGuestEnvelopeBlob,
  generateGuestEnvelopeFile,
  generateGuestPdfFile,
  copyEnvelopeImageToClipboard
} from '../services/envelopeService.js';

let searchQuery = '';
let statusFilter = 'todos';
let unsubscribeStorage = null;

export function renderAdminView(container, options = {}) {
  const highlightedToken = options.highlightToken || null;
  const user = authService.getCurrentUser() || {
    username: 'admin',
    role: 'admin',
    displayName: 'Carlos & Jackie',
    badge: '👑 Administrador'
  };

  const isAdmin = authService.isAdmin();
  const isPorteria = authService.isPorteria();

  const renderContent = () => {
    const guests = storage.getGuests();
    const metrics = storage.getMetrics();

    // Counts for tabs
    const counts = {
      todos: guests.length,
      confirmada: guests.filter(g => g.status === 'confirmada').length,
      pendiente: guests.filter(g => g.status === 'pendiente' || g.status === 'enviada' || g.status === 'vista').length,
      ingreso: guests.filter(g => (g.attendedPasses || 0) > 0 || g.status === 'ingreso').length,
      declinada: guests.filter(g => g.status === 'declinada').length,
      // Porteria specific counts
      porteriaPendientes: guests.filter(g => (g.passes - (g.attendedPasses || 0)) > 0 && g.status !== 'declinada').length,
      porteriaIngresados: guests.filter(g => (g.attendedPasses || 0) > 0).length
    };

    // Filter guests
    const filteredGuests = guests.filter(g => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = q === '' ||
        g.name.toLowerCase().includes(q) ||
        g.id.toLowerCase().includes(q) ||
        (g.phone && g.phone.toLowerCase().includes(q)) ||
        (g.table && g.table.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (isPorteria) {
        if (statusFilter === 'porteria-pendientes') {
          return (g.passes - (g.attendedPasses || 0)) > 0 && g.status !== 'declinada';
        }
        if (statusFilter === 'porteria-ingresados') {
          return (g.attendedPasses || 0) > 0;
        }
        return true;
      }

      // Admin filter
      if (statusFilter === 'todos') return true;
      if (statusFilter === 'confirmada') return g.status === 'confirmada';
      if (statusFilter === 'pendiente') return g.status === 'pendiente' || g.status === 'enviada' || g.status === 'vista';
      if (statusFilter === 'ingreso') return (g.attendedPasses || 0) > 0 || g.status === 'ingreso';
      if (statusFilter === 'declinada') return g.status === 'declinada';
      return true;
    });

    container.innerHTML = `
      <div class="admin-layout">
        <!-- Top Navigation Bar -->
        <nav class="admin-navbar">
          <div class="admin-navbar-inner">
            <div class="admin-brand">
              <div class="admin-brand-icon">
                ${isPorteria ? '🛡️' : '💍'}
              </div>
              <div class="admin-brand-text">
                <h1>${isPorteria ? 'Control de Acceso & Puerta' : 'Panel de Control de Boda'}</h1>
                <p>Carlos & Jackie • Recepciones Villa Venecia (SJL)</p>
              </div>
            </div>

            <!-- Navigation Links -->
            <div class="admin-nav-tabs">
              <a href="#admin" class="admin-nav-link active">
                📋 Lista de Invitados
              </a>
              <a href="#checkin" class="admin-nav-link">
                📷 Escáner QR
              </a>
              ${isAdmin ? `
                <a href="/" target="_blank" class="admin-nav-link" title="Abrir landing page pública en nueva pestaña">
                  💌 Ver Invitación Web ↗
                </a>
              ` : ''}
            </div>

            <!-- User Profile & Logout -->
            <div class="admin-user-profile">
              <span class="role-badge ${isPorteria ? 'role-badge-porteria' : 'role-badge-admin'}">
                ${user.badge || (isPorteria ? '🛡️ Portería' : '👑 Administrador')}
              </span>
              <span style="font-size: 0.85rem; font-weight: 600; color: var(--admin-text-main);">
                ${user.displayName}
              </span>
              <a href="#logout" class="btn-logout" title="Cerrar sesión segura">
                🚪 Salir
              </a>
            </div>
          </div>
        </nav>

        <!-- Main Content Area -->
        <div class="admin-container">
          ${isPorteria ? renderPorteriaBanner() : ''}

          <!-- KPI Metrics Cards -->
          ${isPorteria ? renderPorteriaMetrics(metrics, guests) : renderAdminMetrics(metrics)}

          <!-- Action Toolbar & Filters -->
          <div class="admin-toolbar-card">
            <div class="admin-toolbar-row-top">
              <div class="admin-search-wrap">
                <span class="admin-search-icon">🔍</span>
                <input 
                  type="text" 
                  id="admin-search-input" 
                  class="admin-search-input" 
                  placeholder="${isPorteria ? 'Buscar por apellido, nombre, mesa o código...' : 'Buscar por nombre, código, mesa o WhatsApp...'}" 
                  value="${searchQuery}"
                  autofocus
                >
              </div>

              <div class="admin-action-buttons">
                ${isPorteria ? `
                  <a href="#checkin" class="btn-admin btn-admin-primary">
                    📷 Abrir Escáner QR de Puerta
                  </a>
                ` : `
                  <button id="btn-add-guest" class="btn-admin btn-admin-primary">
                    ➕ Nuevo Invitado
                  </button>
                  <button id="btn-import-excel" class="btn-admin btn-admin-secondary">
                    📥 Importar Excel
                  </button>
                  <button id="btn-export-excel" class="btn-admin btn-admin-secondary">
                    📊 Exportar Excel
                  </button>
                  <button id="btn-export-zip" class="btn-admin btn-admin-secondary" title="Descargar todas las portadas en PDF con QR">
                    📦 Paquete PDFs
                  </button>
                  <button id="btn-manage-music" class="btn-admin btn-admin-secondary" title="Configurar canción nupcial de fondo y volumen">
                    🎵 Música de Boda
                  </button>
                  <button id="btn-reset-demo" class="btn-admin btn-admin-secondary" title="Restaurar datos de prueba">
                    🔄 Reset
                  </button>
                `}
              </div>
            </div>

            <!-- Filter Tabs -->
            <div class="admin-filter-tabs">
              ${isPorteria ? `
                <button class="filter-tab-btn ${statusFilter === 'todos' ? 'active' : ''}" data-filter="todos">
                  Todos los Invitados <span class="filter-count-badge">${counts.todos}</span>
                </button>
                <button class="filter-tab-btn ${statusFilter === 'porteria-pendientes' ? 'active' : ''}" data-filter="porteria-pendientes">
                  ⏳ Pendientes por Ingresar <span class="filter-count-badge">${counts.porteriaPendientes}</span>
                </button>
                <button class="filter-tab-btn ${statusFilter === 'porteria-ingresados' ? 'active' : ''}" data-filter="porteria-ingresados">
                  ✅ Ya en Recepción <span class="filter-count-badge">${counts.porteriaIngresados}</span>
                </button>
              ` : `
                <button class="filter-tab-btn ${statusFilter === 'todos' ? 'active' : ''}" data-filter="todos">
                  Todos <span class="filter-count-badge">${counts.todos}</span>
                </button>
                <button class="filter-tab-btn ${statusFilter === 'confirmada' ? 'active' : ''}" data-filter="confirmada">
                  ✅ Confirmados <span class="filter-count-badge">${counts.confirmada}</span>
                </button>
                <button class="filter-tab-btn ${statusFilter === 'pendiente' ? 'active' : ''}" data-filter="pendiente">
                  ⏳ Pendientes <span class="filter-count-badge">${counts.pendiente}</span>
                </button>
                <button class="filter-tab-btn ${statusFilter === 'ingreso' ? 'active' : ''}" data-filter="ingreso">
                  🎉 En Sala (Check-in) <span class="filter-count-badge">${counts.ingreso}</span>
                </button>
                <button class="filter-tab-btn ${statusFilter === 'declinada' ? 'active' : ''}" data-filter="declinada">
                  ❌ Declinados <span class="filter-count-badge">${counts.declinada}</span>
                </button>
              `}
            </div>
          </div>

          <!-- Guest Data Table -->
          <div class="admin-table-container">
            ${filteredGuests.length === 0 ? `
              <div style="text-align: center; padding: 3rem 1.5rem; color: var(--admin-text-muted);">
                <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
                <h3 style="font-size: 1.1rem; color: var(--admin-text-main); margin-bottom: 0.25rem;">No se encontraron registros</h3>
                <p style="font-size: 0.88rem; margin: 0;">Prueba modificando el texto de búsqueda o cambiando el filtro seleccionado.</p>
              </div>
            ` : `
              <table class="admin-table">
                <thead>
                  <tr>
                    <th style="width: 110px;">Código</th>
                    <th>Invitado / Familia</th>
                    <th style="width: 140px;">${isPorteria ? 'Mesa Asignada' : 'Mesa'}</th>
                    <th style="width: 130px;">Pases</th>
                    <th style="width: 120px;">Estado</th>
                    ${isAdmin ? '<th style="width: 120px;">WhatsApp</th>' : ''}
                    <th style="text-align: right; width: ${isPorteria ? '180px' : '220px'};">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredGuests.map(guest => renderGuestRow(guest, isPorteria, highlightedToken)).join('')}
                </tbody>
              </table>
            `}
          </div>

          <!-- Bottom Summary Bar -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; font-size: 0.82rem; color: var(--admin-text-muted);">
            <span>Mostrando <strong>${filteredGuests.length}</strong> de <strong>${guests.length}</strong> invitados registrados</span>
            <span>📍 Recepciones Villa Venecia — Sábado 26 de Diciembre</span>
          </div>
        </div>
      </div>
    `;

    attachAdminEvents(container, isPorteria);

    if (highlightedToken) {
      setTimeout(() => {
        const row = document.getElementById(`guest-row-${highlightedToken}`);
        if (row) {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          row.style.backgroundColor = '#fef3c7';
          setTimeout(() => { row.style.backgroundColor = ''; }, 3000);
        }
      }, 250);
    }
  };

  // Subscribe to reactive storage updates
  if (unsubscribeStorage) unsubscribeStorage();
  unsubscribeStorage = storage.subscribe(() => {
    if (window.location.hash.startsWith('#admin') || !window.location.hash || window.location.hash === '#') {
      renderContent();
    }
  });

  renderContent();
}

/**
 * Banner shown exclusively for Portería role
 */
function renderPorteriaBanner() {
  return `
    <div class="admin-banner-porteria">
      <div class="admin-banner-porteria-content">
        <span style="font-size: 1.75rem;">🛡️</span>
        <div>
          <h3>Modo Recepción & Portería Activo</h3>
          <p>Consulta rápidamente la mesa asignada de cada invitado y registra su ingreso al local de Villa Venecia.</p>
        </div>
      </div>
      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <span style="font-size: 0.8rem; color: #065f46; font-weight: 600;">Modo Seguro (Solo Lectura + Ingresos)</span>
      </div>
    </div>
  `;
}

/**
 * Door staff metrics (focused on attendance and remaining entries)
 */
function renderPorteriaMetrics(metrics, guests) {
  const totalPasses = metrics.totalPassesIssued;
  const attendedPasses = metrics.totalAttendedPasses;
  const pendingPasses = Math.max(0, totalPasses - attendedPasses);
  const percentage = totalPasses > 0 ? Math.round((attendedPasses / totalPasses) * 100) : 0;

  return `
    <div class="admin-metrics-grid">
      <div class="admin-metric-card">
        <div class="admin-metric-icon icon-blue">🎟️</div>
        <div class="admin-metric-content">
          <div class="admin-metric-label">Pases Totales Asignados</div>
          <div class="admin-metric-number">${totalPasses}</div>
          <div class="admin-metric-subtext">Total de personas convocadas</div>
        </div>
      </div>

      <div class="admin-metric-card">
        <div class="admin-metric-icon icon-emerald">🎉</div>
        <div class="admin-metric-content">
          <div class="admin-metric-label">Pases ya Ingresados</div>
          <div class="admin-metric-number" style="color: var(--admin-success);">${attendedPasses}</div>
          <div class="admin-metric-subtext">${percentage}% del aforo ya en salón</div>
        </div>
      </div>

      <div class="admin-metric-card">
        <div class="admin-metric-icon icon-amber">⏳</div>
        <div class="admin-metric-content">
          <div class="admin-metric-label">Pases Pendientes por Llegar</div>
          <div class="admin-metric-number" style="color: var(--admin-warning);">${pendingPasses}</div>
          <div class="admin-metric-subtext">Aún no registrados en puerta</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Admin metrics (Carlos & Jackie / Wedding Planner)
 */
function renderAdminMetrics(metrics) {
  return `
    <div class="admin-metrics-grid">
      <div class="admin-metric-card">
        <div class="admin-metric-icon icon-purple">👥</div>
        <div class="admin-metric-content">
          <div class="admin-metric-label">Invitados / Familias</div>
          <div class="admin-metric-number">${metrics.totalGroups}</div>
          <div class="admin-metric-subtext">${metrics.totalPassesIssued} pases asignados</div>
        </div>
      </div>

      <div class="admin-metric-card">
        <div class="admin-metric-icon icon-emerald">✅</div>
        <div class="admin-metric-content">
          <div class="admin-metric-label">Confirmados (RSVP)</div>
          <div class="admin-metric-number">${metrics.totalConfirmedPasses}</div>
          <div class="admin-metric-subtext">${metrics.confirmationPercentage}% de asistencia confirmada</div>
        </div>
      </div>

      <div class="admin-metric-card">
        <div class="admin-metric-icon icon-rose">❌</div>
        <div class="admin-metric-content">
          <div class="admin-metric-label">Declinados</div>
          <div class="admin-metric-number">${metrics.totalDeclinedPasses}</div>
          <div class="admin-metric-subtext">Pases liberados</div>
        </div>
      </div>

      <div class="admin-metric-card">
        <div class="admin-metric-icon icon-blue">📲</div>
        <div class="admin-metric-content">
          <div class="admin-metric-label">Ingresos en Sala</div>
          <div class="admin-metric-number">${metrics.totalAttendedPasses} / ${metrics.totalConfirmedPasses || metrics.totalPassesIssued}</div>
          <div class="admin-metric-subtext">${metrics.checkedInGuestsCount} grupos en recepción</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render individual guest table row
 */
function renderGuestRow(guest, isPorteria, highlightedToken) {
  const isHighlighted = highlightedToken && guest.id.toUpperCase() === highlightedToken.toUpperCase();
  const attended = guest.attendedPasses || 0;
  const passes = guest.passes || 1;
  const remaining = Math.max(0, passes - attended);
  const isFullyAttended = attended >= passes;

  let statusClass = 'status-pendiente';
  let statusText = guest.status;

  if (isFullyAttended || guest.status === 'ingreso') {
    statusClass = 'status-ingreso';
    statusText = 'En Fiesta';
  } else if (guest.status === 'confirmada') {
    statusClass = 'status-confirmada';
    statusText = 'Confirmada';
  } else if (guest.status === 'declinada') {
    statusClass = 'status-declinada';
    statusText = 'Declinada';
  } else if (guest.status === 'vista') {
    statusClass = 'status-vista';
    statusText = 'Vista';
  }

  return `
    <tr id="guest-row-${guest.id}" class="${isHighlighted ? 'row-highlighted' : ''}">
      <td>
        <span class="token-chip">${guest.id}</span>
      </td>
      <td>
        <div class="guest-name-box">
          <span class="guest-full-name">${guest.name}</span>
          ${guest.customNote ? `<span class="guest-note-hint">"${guest.customNote}"</span>` : ''}
          ${guest.dietaryRestrictions ? `<span style="font-size: 0.72rem; color: #b91c1c; font-weight: 500;">🥗 ${guest.dietaryRestrictions}</span>` : ''}
        </div>
      </td>
      <td>
        <div class="table-assigned-badge ${isPorteria ? 'porteria-highlight' : ''}">
          🍽️ ${guest.table || 'Por asignar'}
        </div>
      </td>
      <td>
        <div style="font-weight: 600; color: var(--admin-text-main);">
          ${attended > 0 ? `${attended} / ${passes}` : `${passes} pases`}
        </div>
        <div style="font-size: 0.74rem; color: var(--admin-text-muted);">
          ${isFullyAttended ? 'Todos en sala' : `${remaining} por llegar`}
        </div>
      </td>
      <td>
        <span class="status-pill ${statusClass}">
          <span class="status-dot"></span>
          ${statusText}
        </span>
      </td>
      ${!isPorteria ? `
        <td>
          <span style="font-family: monospace; font-size: 0.82rem; color: var(--admin-text-muted);">
            ${guest.phone || '<em style="color: #94a3b8;">Sin número</em>'}
          </span>
        </td>
      ` : ''}
      <td style="text-align: right;">
        <div class="action-cell-btns" style="justify-content: flex-end;">
          ${isPorteria ? `
            ${isFullyAttended ? `
              <span style="font-size: 0.78rem; color: var(--admin-success-text); font-weight: 600; padding: 0.35rem 0.6rem; background: var(--admin-success-light); border-radius: var(--admin-radius);">
                ✅ Ingresado
              </span>
            ` : `
              <button class="btn-admin btn-admin-success btn-quick-checkin-porteria" data-id="${guest.id}" style="padding: 0.4rem 0.75rem; font-size: 0.8rem;">
                ⚡ Registrar Ingreso
              </button>
            `}
          ` : `
            ${guest.phone ? `
              <button class="btn-row-action wa" data-action="whatsapp" data-id="${guest.id}" title="Enviar invitación por WhatsApp">
                💬 WhatsApp
              </button>
            ` : ''}
            <button class="btn-row-action" data-action="pdf" data-id="${guest.id}" title="Descargar tarjeta PDF con QR">
              📄 PDF
            </button>
            <button class="btn-row-action" data-action="view-invite" data-id="${guest.id}" title="Ver invitación personalizada">
              👁️
            </button>
            <button class="btn-row-action checkin" data-action="quick-checkin" data-id="${guest.id}" title="Check-in rápido">
              ⚡
            </button>
            <button class="btn-row-action" data-action="edit" data-id="${guest.id}" title="Editar invitado">
              ✏️
            </button>
            <button class="btn-row-action danger" data-action="delete" data-id="${guest.id}" title="Eliminar de la lista">
              🗑️
            </button>
          `}
        </div>
      </td>
    </tr>
  `;
}

/**
 * Event handlers for admin & porteria actions
 */
function attachAdminEvents(container, isPorteria) {
  // Real-time search with debounce
  const searchInput = container.querySelector('#admin-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      clearTimeout(searchInput._timer);
      searchInput._timer = setTimeout(() => {
        renderAdminView(container);
      }, 200);
    });
  }

  // Filter Tabs
  container.querySelectorAll('.filter-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      statusFilter = btn.dataset.filter;
      renderAdminView(container);
    });
  });

  // Portería Quick Check-in
  container.querySelectorAll('.btn-quick-checkin-porteria').forEach(btn => {
    btn.addEventListener('click', () => {
      const guestId = btn.dataset.id;
      const guest = storage.getGuestById(guestId);
      if (!guest) return;
      openPorteriaCheckinModal(guest);
    });
  });

  // Admin Only Actions
  if (!isPorteria) {
    // Add Guest
    container.querySelector('#btn-add-guest')?.addEventListener('click', () => {
      openGuestModal();
    });

    // Import Excel
    container.querySelector('#btn-import-excel')?.addEventListener('click', () => {
      openImportModal();
    });

    // Export Excel
    container.querySelector('#btn-export-excel')?.addEventListener('click', () => {
      const guests = storage.getGuests();
      exportGuestsToExcel(guests);
      showToast('Exportando lista de invitados a Excel...', 'success');
    });

    // Bulk PDF Zip
    container.querySelector('#btn-export-zip')?.addEventListener('click', async () => {
      const guests = storage.getGuests();
      if (guests.length === 0) {
        showToast('No hay invitados registrados.', 'warning');
        return;
      }

      showModal({
        title: '📦 Generando Paquete ZIP de Invitaciones',
        bodyHtml: `
          <div style="text-align: center; padding: 1.5rem;">
            <p style="margin-bottom: 1rem; color: var(--admin-text-muted);">
              Preparando tarjetas en alta definición con código QR personalizado para cada familia...
            </p>
            <div style="width: 100%; height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; margin-bottom: 1rem;">
              <div id="zip-progress-bar" style="width: 0%; height: 100%; background: var(--admin-primary); transition: width 0.2s ease;"></div>
            </div>
            <p id="zip-progress-label" style="font-weight: 600; font-size: 0.88rem; color: var(--admin-primary);">Iniciando compilación...</p>
          </div>
        `,
        footerHtml: ''
      });

      try {
        await downloadAllGuestsZip(guests, (current, total, name) => {
          const percent = Math.round((current / total) * 100);
          const bar = document.getElementById('zip-progress-bar');
          const label = document.getElementById('zip-progress-label');
          if (bar) bar.style.width = `${percent}%`;
          if (label) label.textContent = `Procesando ${current}/${total}: ${name}`;
        });
        closeModal();
        showToast('¡Archivo ZIP descargado exitosamente!', 'success');
      } catch (err) {
        console.error(err);
        closeModal();
        showToast('Error al compilar archivo ZIP.', 'error');
      }
    });

    // Reset Demo
    container.querySelector('#btn-reset-demo')?.addEventListener('click', () => {
      if (confirm('¿Deseas restaurar la lista a los 6 invitados de demostración iniciales? Se perderán las modificaciones no respaldadas.')) {
        storage.resetToDefaults();
        showToast('Datos de demostración restaurados.', 'info');
      }
    });

    // Manage Wedding Music
    container.querySelector('#btn-manage-music')?.addEventListener('click', () => {
      openMusicConfigModal();
    });

    // Admin Table Row Buttons
    const tableContainer = container.querySelector('.admin-table-container');
    if (tableContainer) {
      tableContainer.addEventListener('click', async (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;

        const action = btn.dataset.action;
        const guestId = btn.dataset.id;
        const guest = storage.getGuestById(guestId);
        if (!guest) return;

        if (action === 'whatsapp') {
          openWhatsAppModal(guest);
        } else if (action === 'pdf') {
          showToast(`Generando portada PDF para ${guest.name}...`, 'info');
          try {
            await downloadGuestPdf(guest);
            showToast('PDF descargado.', 'success');
          } catch (err) {
            console.error(err);
            showToast('Error al generar PDF.', 'error');
          }
        } else if (action === 'view-invite') {
          window.open(`/?inv=${encodeURIComponent(guest.id)}`, '_blank');
        } else if (action === 'quick-checkin') {
          const remaining = guest.passes - (guest.attendedPasses || 0);
          if (remaining <= 0) {
            showToast(`${guest.name} ya tiene todos sus pases registrados en sala.`, 'warning');
            return;
          }
          const res = storage.checkinGuest(guest.id, 1);
          if (res.success) {
            audioEngine.playSuccessChime();
            showToast(`Ingreso registrado: ${guest.name} (${res.newAttended}/${guest.passes} pases).`, 'success');
          }
        } else if (action === 'edit') {
          openGuestModal(guest);
        } else if (action === 'delete') {
          if (confirm(`¿Estás seguro de eliminar a "${guest.name}" (${guest.id}) de la lista de invitados?`)) {
            storage.deleteGuest(guest.id);
            showToast('Invitado eliminado.', 'info');
          }
        }
      });
    }
  }
}

/**
 * Portería Dedicated Fast Check-in Modal
 */
function openPorteriaCheckinModal(guest) {
  const remaining = guest.passes - (guest.attendedPasses || 0);

  // If only 1 pass left, record instantly with 1 tap
  if (remaining <= 1) {
    const res = storage.checkinGuest(guest.id, 1);
    if (res.success) {
      audioEngine.playSuccessChime();
      showToast(`✅ ¡Ingreso registrado para ${guest.name}! Mesa: ${guest.table || 'Por asignar'}`, 'success');
    }
    return;
  }

  // If multiple passes remaining, allow selecting quantity
  showModal({
    title: `🛡️ Registrar Ingreso en Puerta`,
    bodyHtml: `
      <div style="text-align: center; padding: 0.5rem 0;">
        <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--admin-text-main); margin-bottom: 0.25rem;">
          ${guest.name}
        </h3>
        <p style="font-size: 0.85rem; color: var(--admin-text-muted); margin-bottom: 1.25rem;">
          Código de invitación: <strong>${guest.id}</strong>
        </p>

        <!-- Big Highlighted Table Banner -->
        <div style="background: #e0f2fe; border: 2px solid #38bdf8; border-radius: var(--admin-radius); padding: 1rem; margin-bottom: 1.5rem;">
          <div style="font-size: 0.8rem; font-weight: 600; text-transform: uppercase; color: #0369a1; letter-spacing: 0.05em;">
            Mesa Asignada para esta Familia
          </div>
          <div style="font-size: 1.75rem; font-weight: 800; color: #0c4a6e; margin-top: 0.25rem;">
            🍽️ ${guest.table || 'Sin mesa asignada'}
          </div>
        </div>

        <div style="text-align: left; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--admin-radius); padding: 1rem; margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.88rem;">
            <span>Pases totales reservados:</span>
            <strong>${guest.passes} personas</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.88rem;">
            <span>Personas ya en sala:</span>
            <strong style="color: var(--admin-success);">${guest.attendedPasses || 0} personas</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.88rem; border-top: 1px dashed #cbd5e1; padding-top: 0.5rem;">
            <span>Pases pendientes por entrar:</span>
            <strong style="color: var(--admin-warning); font-size: 1rem;">${remaining} personas</strong>
          </div>
        </div>

        <label style="display: block; text-align: left; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem;">
          ¿Cuántas personas están ingresando en este momento?
        </label>
        <div style="display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 1rem;">
          ${Array.from({ length: remaining }, (_, i) => i + 1).map(n => `
            <button type="button" class="btn-admin ${n === remaining ? 'btn-admin-primary' : 'btn-admin-secondary'} btn-pass-qty" data-qty="${n}" style="min-width: 50px; font-weight: 700; font-size: 1rem; padding: 0.6rem 1rem;">
              ${n === remaining ? `Todos (${n})` : n}
            </button>
          `).join('')}
        </div>
      </div>
    `,
    footerHtml: `
      <button type="button" class="btn-admin btn-admin-secondary" id="btn-cancel-porteria-modal">Cancelar</button>
    `,
    onMount: () => {
      document.getElementById('btn-cancel-porteria-modal')?.addEventListener('click', closeModal);

      document.querySelectorAll('.btn-pass-qty').forEach(b => {
        b.addEventListener('click', () => {
          const qty = parseInt(b.dataset.qty, 10);
          const res = storage.checkinGuest(guest.id, qty);
          if (res.success) {
            audioEngine.playSuccessChime();
            closeModal();
            showToast(`✅ Se registró el ingreso de ${qty} personas de ${guest.name}. Mesa: ${guest.table}`, 'success');
          }
        });
      });
    }
  });
}

/**
 * Modal to Add or Edit a Guest (Admin only)
 */
function openGuestModal(existingGuest = null) {
  const isEdit = !!existingGuest;
  const title = isEdit ? `✏️ Editar Invitado — ${existingGuest.id}` : '➕ Nuevo Invitado';

  const bodyHtml = `
    <form id="form-guest-edit" style="display: flex; flex-direction: column; gap: 1rem;">
      <div class="auth-field-group">
        <label class="auth-label" for="edit-guest-name">Nombre del Invitado o Familia *</label>
        <input type="text" id="edit-guest-name" class="auth-input" required 
          placeholder="Ej: Familia Morales Ruiz o Ing. Daniel Ríos y Acompañante"
          value="${existingGuest ? existingGuest.name : ''}">
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="auth-field-group">
          <label class="auth-label" for="edit-guest-phone">Teléfono / WhatsApp</label>
          <input type="tel" id="edit-guest-phone" class="auth-input" 
            placeholder="+51 987 654 321"
            value="${existingGuest ? (existingGuest.phone || '') : ''}">
        </div>
        <div class="auth-field-group">
          <label class="auth-label" for="edit-guest-passes">Pases Asignados *</label>
          <input type="number" id="edit-guest-passes" class="auth-input" min="1" max="10" required
            value="${existingGuest ? existingGuest.passes : 2}">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="auth-field-group">
          <label class="auth-label" for="edit-guest-table">Mesa Asignada</label>
          <input type="text" id="edit-guest-table" class="auth-input" 
            placeholder="Ej: Mesa 4, Mesa de Honor..."
            value="${existingGuest ? (existingGuest.table || 'Por asignar') : 'Por asignar'}">
        </div>
        <div class="auth-field-group">
          <label class="auth-label" for="edit-guest-status">Estado de Invitación</label>
          <select id="edit-guest-status" class="auth-input" style="height: 42px;">
            <option value="pendiente" ${existingGuest && existingGuest.status === 'pendiente' ? 'selected' : ''}>⏳ Pendiente</option>
            <option value="enviada" ${existingGuest && existingGuest.status === 'enviada' ? 'selected' : ''}>📤 Enviada</option>
            <option value="vista" ${existingGuest && existingGuest.status === 'vista' ? 'selected' : ''}>👁️ Vista</option>
            <option value="confirmada" ${existingGuest && existingGuest.status === 'confirmada' ? 'selected' : ''}>✅ Confirmada</option>
            <option value="declinada" ${existingGuest && existingGuest.status === 'declinada' ? 'selected' : ''}>❌ Declinada</option>
            <option value="ingreso" ${existingGuest && existingGuest.status === 'ingreso' ? 'selected' : ''}>🎉 Ingreso</option>
          </select>
        </div>
      </div>

      <div class="auth-field-group">
        <label class="auth-label" for="edit-guest-note">Dedicatoria Personalizada para el Sobre</label>
        <textarea id="edit-guest-note" class="auth-input" rows="2" 
          placeholder="Ej: ¡Los esperamos con todo nuestro cariño para celebrar juntos!">${existingGuest ? (existingGuest.customNote || '') : ''}</textarea>
        <span style="font-size: 0.75rem; color: var(--admin-text-subtle);">Aparecerá impresa en la portada de su sobre digital y PDF.</span>
      </div>

      ${isEdit ? `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 0.75rem 1rem; border-radius: var(--admin-radius); font-size: 0.8rem; color: var(--admin-text-muted);">
          <div><strong>Pases Confirmados:</strong> ${existingGuest.confirmedPasses || 0} / ${existingGuest.passes}</div>
          <div><strong>Pases ya Ingresados en Puerta:</strong> ${existingGuest.attendedPasses || 0}</div>
          ${existingGuest.dietaryRestrictions ? `<div><strong>Restricciones Alimentarias:</strong> ${existingGuest.dietaryRestrictions}</div>` : ''}
        </div>
      ` : ''}
    </form>
  `;

  const footerHtml = `
    <button type="button" class="btn-admin btn-admin-secondary" id="btn-cancel-modal">Cancelar</button>
    <button type="button" class="btn-admin btn-admin-primary" id="btn-save-guest">${isEdit ? 'Guardar Cambios' : 'Crear Invitado'}</button>
  `;

  showModal({
    title,
    bodyHtml,
    footerHtml,
    onMount: () => {
      document.getElementById('btn-cancel-modal')?.addEventListener('click', closeModal);
      document.getElementById('btn-save-guest')?.addEventListener('click', () => {
        const name = document.getElementById('edit-guest-name').value.trim();
        const phone = document.getElementById('edit-guest-phone').value.trim();
        const passes = parseInt(document.getElementById('edit-guest-passes').value, 10) || 1;
        const table = document.getElementById('edit-guest-table').value.trim() || 'Por asignar';
        const status = document.getElementById('edit-guest-status').value;
        const customNote = document.getElementById('edit-guest-note').value.trim();

        if (!name) {
          alert('Por favor, ingresa el nombre del invitado o familia.');
          return;
        }

        const payload = {
          ...(existingGuest || {}),
          name,
          phone,
          passes,
          table,
          status,
          customNote
        };

        if (status === 'confirmada' && (!payload.confirmedPasses || payload.confirmedPasses === 0)) {
          payload.confirmedPasses = passes;
        }

        storage.saveGuest(payload);
        closeModal();
        showToast(isEdit ? 'Invitado actualizado exitosamente.' : 'Nuevo invitado registrado con éxito.', 'success');
      });
    }
  });
}

/**
 * WhatsApp Share Modal (Admin only) - Enhanced with Live Envelope Preview & File Attachments
 */
function openWhatsAppModal(guest) {
  const invitationUrl = getInvitationUrl(guest.id);
  const cleanPhone = (guest.phone || '').replace(/[^0-9]/g, '');

  const defaultMsg = `💍 *¡Nuestra Boda! Carlos & Jackie* 💍\n\nEstimados *${guest.name}*,\nNos llena de inmensa felicidad invitarles a celebrar nuestra boda civil y recepción en *Recepciones Villa Venecia* (SJL).\n\n💌 *Tu Invitación Virtual Personalizada:*\n${invitationUrl}\n\n🎫 *Pases Reservados:* ${guest.passes}\n🍽️ *Mesa Asignada:* ${guest.table || 'Por asignar'}\n\nHaz clic en el enlace para ver los detalles, el dress code y confirmar tu asistencia.\n\n_¡Esperamos contar con su cariño en este día tan especial!_ ✨`;

  let selectedFormat = 'image'; // 'image' or 'pdf'
  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  showModal({
    title: `💬 Enviar Sobre Digital por WhatsApp — ${guest.name}`,
    bodyHtml: `
      <div class="wa-modal-layout">
        <!-- Live Envelope Preview -->
        <div class="wa-preview-card">
          <div style="font-size: 0.8rem; font-weight: 700; color: #a87424; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">
            Vista Previa del Sobre Digital Personalizado
          </div>
          <div id="wa-envelope-preview-container" class="wa-envelope-frame">
            <div style="padding: 2.5rem; color: var(--admin-text-muted); font-size: 0.85rem;">
              🎨 Generando sobre personalizado para ${guest.name}...
            </div>
          </div>

          <!-- Format Selector Pills -->
          <div class="wa-format-pills">
            <button type="button" class="wa-format-pill active" id="btn-format-image" data-format="image">
              🖼️ Adjuntar Imagen (PNG)
            </button>
            <button type="button" class="wa-format-pill" id="btn-format-pdf" data-format="pdf">
              📄 Adjuntar PDF Interactivo
            </button>
          </div>
        </div>

        <!-- Instructions Tip -->
        <div class="wa-instruction-tip" id="wa-instruction-box">
          <span style="font-size: 1.25rem;">💡</span>
          <div>
            <strong>¿Cómo funciona el envío adjunto?</strong><br>
            <span id="wa-instruction-text">
              <strong>En WhatsApp Web (PC):</strong> Al hacer clic en <em>"Abrir WhatsApp Web"</em>, la imagen se copia automáticamente al portapapeles y se descarga el archivo. En el chat solo presiona <code>Ctrl + V</code> para adjuntarla como foto con el mensaje.
            </span>
          </div>
        </div>

        <!-- Message Editor -->
        <div class="auth-field-group">
          <label class="auth-label">Mensaje personalizado y enlace:</label>
          <textarea id="wa-message-preview" class="auth-input" rows="7" style="font-family: monospace; font-size: 0.82rem; line-height: 1.4;">${defaultMsg}</textarea>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid var(--admin-border); padding: 0.65rem 1rem; border-radius: var(--admin-radius); font-size: 0.82rem;">
          <div>
            <strong>Destinatario:</strong> ${guest.phone || '<em style="color:#94a3b8;">Sin número asignado</em>'}
          </div>
          <div>
            <strong>Pases:</strong> ${guest.passes} &bull; <strong>Mesa:</strong> ${guest.table || 'Por asignar'}
          </div>
        </div>
      </div>
    `,
    footerHtml: `
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; width: 100%; justify-content: space-between; align-items: center;">
        <div style="display: flex; gap: 0.4rem;">
          <button class="btn-admin btn-admin-secondary" id="btn-download-attached" title="Descargar archivo en la computadora">
            📥 Descargar <span id="btn-dl-label">Imagen</span>
          </button>
          <button class="btn-admin btn-admin-secondary" id="btn-copy-wa" title="Copiar texto del mensaje">
            📋 Copiar Texto
          </button>
        </div>

        <div style="display: flex; gap: 0.5rem;">
          ${canNativeShare ? `
            <button class="btn-admin btn-whatsapp-action" id="btn-native-share" title="Compartir directo con archivo adjunto">
              📲 Compartir con Archivo Adjunto
            </button>
          ` : ''}
          <button class="btn-admin btn-admin-primary" id="btn-open-wa" title="Abrir WhatsApp Web y copiar imagen para pegar">
            💬 Abrir WhatsApp Web
          </button>
        </div>
      </div>
    `,
    onMount: async () => {
      const previewContainer = document.getElementById('wa-envelope-preview-container');
      const instructionText = document.getElementById('wa-instruction-text');
      const dlLabel = document.getElementById('btn-dl-label');

      // Generate canvas thumbnail asynchronously
      try {
        const canvas = await generateGuestEnvelopeCanvas(guest);
        if (previewContainer) {
          previewContainer.innerHTML = '';
          canvas.style.maxWidth = '100%';
          canvas.style.height = 'auto';
          previewContainer.appendChild(canvas);
        }
      } catch (e) {
        console.error('Error generating envelope canvas preview:', e);
        if (previewContainer) {
          previewContainer.innerHTML = `<img src="/assets/sobre_lacre.jpg" alt="Sobre de Invitación">`;
        }
      }

      // Format Selector
      const btnFormatImage = document.getElementById('btn-format-image');
      const btnFormatPdf = document.getElementById('btn-format-pdf');

      const updateFormatUi = (fmt) => {
        selectedFormat = fmt;
        if (fmt === 'image') {
          btnFormatImage?.classList.add('active');
          btnFormatPdf?.classList.remove('active');
          if (dlLabel) dlLabel.textContent = 'Imagen (PNG)';
          if (instructionText) {
            instructionText.innerHTML = `<strong>En WhatsApp Web (PC):</strong> Al hacer clic en <em>"Abrir WhatsApp Web"</em>, la imagen se copia automáticamente al portapapeles y se descarga el archivo. En el chat solo presiona <code>Ctrl + V</code> para adjuntarla como foto con el mensaje.`;
          }
        } else {
          btnFormatPdf?.classList.add('active');
          btnFormatImage?.classList.remove('active');
          if (dlLabel) dlLabel.textContent = 'PDF Interactivo';
          if (instructionText) {
            instructionText.innerHTML = `<strong>En WhatsApp Web (PC):</strong> Se descargará el PDF oficial interactivo (con hipervínculo clickeable y QR). En el chat solo arrastra el archivo descargado para adjuntarlo como documento.`;
          }
        }
      };

      btnFormatImage?.addEventListener('click', () => updateFormatUi('image'));
      btnFormatPdf?.addEventListener('click', () => updateFormatUi('pdf'));

      // Copy Text Button
      document.getElementById('btn-copy-wa')?.addEventListener('click', () => {
        const text = document.getElementById('wa-message-preview').value;
        navigator.clipboard.writeText(text);
        showToast('Mensaje copiado al portapapeles.', 'success');
      });

      // Download Attached File Button
      document.getElementById('btn-download-attached')?.addEventListener('click', async () => {
        if (selectedFormat === 'image') {
          const blob = await generateGuestEnvelopeBlob(guest);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Sobre_Invitacion_${guest.name.replace(/\s+/g, '_')}_${guest.id}.png`;
          a.click();
          URL.revokeObjectURL(url);
          showToast('Imagen del sobre descargada.', 'success');
        } else {
          await downloadGuestPdf(guest);
          showToast('PDF interactivo descargado.', 'success');
        }
      });

      // Native Share (Mobile / Tablet / Compatible Desktop)
      document.getElementById('btn-native-share')?.addEventListener('click', async () => {
        const text = document.getElementById('wa-message-preview').value;
        showToast('Preparando archivo para compartir...', 'info');

        try {
          let file;
          if (selectedFormat === 'image') {
            file = await generateGuestEnvelopeFile(guest);
          } else {
            file = await generateGuestPdfFile(guest);
          }

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `Invitación de Boda Carlos & Jackie — ${guest.name}`,
              text: text,
              files: [file]
            });
            // Mark as sent
            if (guest.status === 'pendiente') {
              guest.status = 'enviada';
              storage.saveGuest(guest);
            }
            closeModal();
            showToast('¡Invitación compartida con archivo adjunto!', 'success');
          } else {
            // Fallback to text share
            await navigator.share({
              title: `Invitación de Boda Carlos & Jackie — ${guest.name}`,
              text: text
            });
            closeModal();
          }
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('Error sharing natively:', err);
            showToast('No se pudo compartir directamente. Usando WhatsApp Web...', 'warning');
            openWhatsAppWebFlow();
          }
        }
      });

      // WhatsApp Web Flow (Desktop + Mobile fallback)
      const openWhatsAppWebFlow = async () => {
        const text = document.getElementById('wa-message-preview').value;
        const targetUrl = cleanPhone 
          ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
          : `https://wa.me/?text=${encodeURIComponent(text)}`;

        // If image format, copy to clipboard for instant Ctrl+V
        if (selectedFormat === 'image') {
          const copied = await copyEnvelopeImageToClipboard(guest);
          // Also trigger automatic download of image
          const blob = await generateGuestEnvelopeBlob(guest);
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = `Sobre_Invitacion_${guest.name.replace(/\s+/g, '_')}_${guest.id}.png`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);

          if (copied) {
            showToast('✨ ¡Sobre copiado! En WhatsApp presiona Ctrl + V para pegarlo como foto.', 'success');
          } else {
            showToast('Archivo descargado. Arrástralo al chat de WhatsApp.', 'info');
          }
        } else {
          // PDF format: download PDF
          await downloadGuestPdf(guest);
          showToast('📄 PDF descargado. Arrástralo al chat de WhatsApp.', 'info');
        }

        // Mark status as enviada
        if (guest.status === 'pendiente') {
          guest.status = 'enviada';
          storage.saveGuest(guest);
        }

        // Open WhatsApp Web in new tab
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      };

      document.getElementById('btn-open-wa')?.addEventListener('click', openWhatsAppWebFlow);
    }
  });
}

/**
 * Excel / CSV Import Modal (Admin only)
 */
function openImportModal() {
  showModal({
    title: '📥 Importar Invitados desde Excel o CSV',
    bodyHtml: `
      <div>
        <p style="font-size: 0.88rem; color: var(--admin-text-muted); margin-bottom: 1.25rem;">
          Importa tu lista masiva de invitados cargando una hoja de cálculo. Descarga la plantilla oficial para asegurar que las columnas coincidan:
        </p>

        <div style="text-align: center; margin-bottom: 1.5rem;">
          <button id="btn-dl-template" class="btn-admin btn-admin-secondary">
            📑 Descargar Plantilla Excel de Ejemplo (.xlsx)
          </button>
        </div>

        <div style="border: 2px dashed #93c5fd; border-radius: var(--admin-radius); padding: 2rem 1rem; text-align: center; background: #eff6ff; cursor: pointer;" id="excel-dropzone">
          <span style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem;">📁</span>
          <p style="font-weight: 600; color: #1e3a8a; margin-bottom: 0.25rem;">
            Arrastra tu archivo aquí o haz clic para seleccionarlo
          </p>
          <span style="font-size: 0.78rem; color: var(--admin-text-muted);">Soporta formatos .xlsx, .xls y .csv</span>
          <input type="file" id="excel-file-input" accept=".xlsx, .xls, .csv" style="display: none;">
        </div>

        <div id="import-preview-box" style="margin-top: 1.25rem; display: none;"></div>
      </div>
    `,
    footerHtml: `
      <button class="btn-admin btn-admin-secondary" id="btn-cancel-import">Cerrar</button>
      <button class="btn-admin btn-admin-primary" id="btn-execute-import" disabled>Confirmar e Importar</button>
    `,
    onMount: () => {
      document.getElementById('btn-cancel-import')?.addEventListener('click', closeModal);

      document.getElementById('btn-dl-template')?.addEventListener('click', () => {
        downloadExcelTemplate();
        showToast('Plantilla descargada.', 'success');
      });

      const dropzone = document.getElementById('excel-dropzone');
      const fileInput = document.getElementById('excel-file-input');
      const executeBtn = document.getElementById('btn-execute-import');
      const previewBox = document.getElementById('import-preview-box');

      let parsedData = [];

      dropzone?.addEventListener('click', () => fileInput?.click());

      fileInput?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
          parsedData = await parseExcelOrCsvFile(file);
          previewBox.style.display = 'block';
          previewBox.innerHTML = `
            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: var(--admin-radius); padding: 0.85rem 1rem; color: #065f46; font-size: 0.85rem;">
              ✅ <strong>${parsedData.length} registros listos</strong> para ser importados.
              <ul style="margin-top: 0.5rem; padding-left: 1.25rem; font-size: 0.8rem; color: var(--admin-text-main);">
                ${parsedData.slice(0, 3).map(p => `<li>${p.name} — ${p.passes} pases (${p.table})</li>`).join('')}
                ${parsedData.length > 3 ? `<li><em>... y ${parsedData.length - 3} más</em></li>` : ''}
              </ul>
            </div>
          `;
          executeBtn.removeAttribute('disabled');
        } catch (err) {
          console.error(err);
          previewBox.style.display = 'block';
          previewBox.innerHTML = `
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: var(--admin-radius); padding: 0.85rem 1rem; color: #991b1b; font-size: 0.85rem;">
              ⚠️ Error al leer archivo: ${err.message || 'Formato no reconocido'}
            </div>
          `;
          executeBtn.setAttribute('disabled', 'true');
        }
      });

      executeBtn?.addEventListener('click', () => {
        if (!parsedData || parsedData.length === 0) return;
        storage.bulkAddGuests(parsedData);
        closeModal();
        showToast(`¡Se importaron ${parsedData.length} invitados exitosamente!`, 'success');
      });
    }
  });
}

/**
 * Modal to Manage Wedding Music (File upload, cloud URL, volume & live test)
 */
function openMusicConfigModal() {
  const settings = storage.getMusicSettings();
  let tempAudioUrl = settings.url || '/assets/musica.mp3';
  let tempVolume = settings.volume !== undefined ? settings.volume : 0.65;
  let testAudio = null;

  showModal({
    title: '🎵 Configuración de la Canción de la Boda',
    bodyHtml: `
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="background: #fdfbf7; border: 1px solid #e7dfd1; border-radius: var(--admin-radius); padding: 1rem; font-size: 0.88rem; color: #4b443b;">
          <strong style="color: #2b2620; display: block; margin-bottom: 0.35rem;">✨ Especificaciones recomendadas para el audio:</strong>
          <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.83rem; line-height: 1.5;">
            <li><strong>Formato ideal:</strong> Archivo <code>.mp3</code> (estéreo, 128 o 192 kbps, 44.1 kHz).</li>
            <li><strong>Reproducción en Bucle (Loop):</strong> La canción se repite de forma perpetua e infinita automáticamente.</li>
            <li><strong>Ubicación local en el proyecto:</strong> Puedes colocar tu archivo directamente en <code>public/assets/musica.mp3</code> o subirlo desde este panel.</li>
          </ul>
        </div>

        <!-- Forma A: Subir archivo desde la computadora / celular -->
        <div>
          <label style="display: block; font-weight: 600; font-size: 0.88rem; margin-bottom: 0.4rem; color: var(--admin-text-main);">
            Opción 1: Subir archivo de audio desde tu dispositivo (.mp3, .m4a, .aac, .ogg)
          </label>
          <div id="music-dropzone" style="border: 2px dashed #b89146; border-radius: var(--admin-radius); padding: 1.25rem 1rem; text-align: center; background: rgba(253, 246, 236, 0.5); cursor: pointer; transition: all 0.2s ease;">
            <div style="font-size: 1.8rem; margin-bottom: 0.35rem;">🎶</div>
            <p style="font-size: 0.9rem; font-weight: 600; color: #726243; margin-bottom: 0.2rem;">
              Haz clic aquí o arrastra tu archivo MP3
            </p>
            <p id="music-file-chosen-label" style="font-size: 0.8rem; color: var(--admin-text-muted);">
              Archivo actual: <code>${settings.url}</code>
            </p>
            <input type="file" id="music-file-input" accept="audio/*,.mp3,.m4a,.aac,.ogg,.wav" style="display: none;">
          </div>
        </div>

        <!-- Forma B: Enlace URL directo -->
        <div>
          <label class="auth-label" for="music-url-input">
            Opción 2: O ingresar URL directa en la nube (Dropbox, Drive, servidor propio):
          </label>
          <input 
            type="text" 
            id="music-url-input" 
            class="auth-input" 
            placeholder="Ej: /assets/musica.mp3 o https://miservidor.com/cancion.mp3"
            value="${settings.url}"
          >
        </div>

        <!-- Control de Volumen Predeterminado -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
            <label class="auth-label" style="margin-bottom: 0;">Volumen de inicio de la música:</label>
            <span id="modal-vol-label" style="font-weight: 700; color: #b89146; font-size: 0.9rem;">
              ${Math.round(tempVolume * 100)}%
            </span>
          </div>
          <input 
            type="range" 
            id="modal-vol-slider" 
            min="0" 
            max="100" 
            value="${Math.round(tempVolume * 100)}" 
            style="width: 100%; accent-color: #b89146;"
          >
        </div>

        <!-- Reproductor de Prueba en Vivo -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--admin-radius); padding: 0.85rem 1rem; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-weight: 600; font-size: 0.88rem; color: var(--admin-text-main);">Probar sonido</div>
            <div id="modal-test-status" style="font-size: 0.78rem; color: var(--admin-text-muted);">Listo para reproducir</div>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button type="button" class="btn-admin btn-admin-secondary" id="btn-modal-test-play" style="padding: 0.4rem 0.85rem;">
              ▶ Escuchar
            </button>
            <button type="button" class="btn-admin btn-admin-secondary" id="btn-modal-test-stop" style="padding: 0.4rem 0.85rem;" disabled>
              ❚❚ Detener
            </button>
          </div>
        </div>
      </div>
    `,
    footerHtml: `
      <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
        <button type="button" class="btn-admin btn-admin-secondary" id="btn-restore-default-music" style="color: #64748b; font-size: 0.82rem;">
          🔄 Restaurar Predeterminado
        </button>
        <div style="display: flex; gap: 0.5rem;">
          <button type="button" class="btn-admin btn-admin-secondary" id="btn-close-music-modal">Cancelar</button>
          <button type="button" class="btn-admin btn-admin-primary" id="btn-save-music-settings">💾 Guardar Canción</button>
        </div>
      </div>
    `,
    onMount: () => {
      const dropzone = document.getElementById('music-dropzone');
      const fileInput = document.getElementById('music-file-input');
      const urlInput = document.getElementById('music-url-input');
      const chosenLabel = document.getElementById('music-file-chosen-label');
      const volSlider = document.getElementById('modal-vol-slider');
      const volLabel = document.getElementById('modal-vol-label');
      const btnTestPlay = document.getElementById('btn-modal-test-play');
      const btnTestStop = document.getElementById('btn-modal-test-stop');
      const testStatus = document.getElementById('modal-test-status');
      const btnSave = document.getElementById('btn-save-music-settings');
      const btnRestore = document.getElementById('btn-restore-default-music');
      const btnCancel = document.getElementById('btn-close-music-modal');

      const stopTestAudio = () => {
        if (testAudio) {
          testAudio.pause();
          testAudio.currentTime = 0;
          testAudio = null;
        }
        if (btnTestPlay) btnTestPlay.disabled = false;
        if (btnTestStop) btnTestStop.disabled = true;
        if (testStatus) testStatus.textContent = 'Detenido';
      };

      btnCancel?.addEventListener('click', () => {
        stopTestAudio();
        closeModal();
      });

      // Volume slider change
      volSlider?.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        tempVolume = val / 100;
        if (volLabel) volLabel.textContent = `${val}%`;
        if (testAudio) testAudio.volume = tempVolume;
      });

      // File chooser
      dropzone?.addEventListener('click', () => fileInput?.click());

      let selectedFileObj = null;

      fileInput?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        selectedFileObj = file;
        chosenLabel.innerHTML = `⏳ Preparando archivo <strong>${file.name}</strong> (${(file.size / (1024 * 1024)).toFixed(2)} MB)...`;

        // Create zero-latency Object URL for live testing
        try {
          tempAudioUrl = URL.createObjectURL(file);
          urlInput.value = `/assets/musica.mp3 (Listo para guardar: ${file.name})`;
          chosenLabel.innerHTML = `✅ Archivo listo: <strong>${file.name}</strong> (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
          showToast(`Archivo "${file.name}" cargado. Puedes probarlo antes de guardar.`, 'info');
        } catch (err) {
          console.warn('Object URL error:', err);
        }
      });

      urlInput?.addEventListener('input', (e) => {
        tempAudioUrl = e.target.value.trim();
        selectedFileObj = null;
        chosenLabel.innerHTML = `URL personalizada: <code>${tempAudioUrl}</code>`;
      });

      // Test audio playback
      btnTestPlay?.addEventListener('click', () => {
        stopTestAudio();
        const currentSrc = tempAudioUrl || urlInput.value.trim() || '/assets/musica.mp3';
        testAudio = new Audio(currentSrc);
        testAudio.loop = true;
        testAudio.volume = tempVolume;

        testStatus.textContent = 'Conectando audio...';
        btnTestPlay.disabled = true;
        btnTestStop.disabled = false;

        testAudio.play().then(() => {
          testStatus.textContent = '♪ Reproduciendo en bucle...';
        }).catch(err => {
          console.warn('Test audio error:', err);
          testStatus.textContent = '⚠️ Error al reproducir. Revisa la URL o el archivo.';
          btnTestPlay.disabled = false;
          btnTestStop.disabled = true;
        });
      });

      btnTestStop?.addEventListener('click', stopTestAudio);

      // Restore default
      btnRestore?.addEventListener('click', () => {
        stopTestAudio();
        tempAudioUrl = '/assets/musica.mp3';
        selectedFileObj = null;
        tempVolume = 0.65;
        urlInput.value = '/assets/musica.mp3';
        volSlider.value = 65;
        volLabel.textContent = '65%';
        chosenLabel.innerHTML = `Archivo predeterminado: <code>/assets/musica.mp3</code>`;
        showToast('Restaurado a la ruta predeterminada /assets/musica.mp3', 'info');
      });

      // Save
      btnSave?.addEventListener('click', async () => {
        stopTestAudio();
        btnSave.disabled = true;
        btnSave.textContent = '⏳ Guardando...';

        let finalUrl = '/assets/musica.mp3';

        if (selectedFileObj) {
          // Upload file directly to server or IndexedDB
          try {
            const saveRes = await audioStorage.saveAudioFile(selectedFileObj);
            if (saveRes && saveRes.url) {
              finalUrl = saveRes.url;
            }
          } catch (err) {
            console.warn('Error saving audio file via audioStorage:', err);
          }
        } else if (tempAudioUrl && !tempAudioUrl.startsWith('blob:')) {
          finalUrl = tempAudioUrl;
        } else if (urlInput.value.trim() && !urlInput.value.includes('(')) {
          finalUrl = urlInput.value.trim();
        }

        storage.saveMusicSettings({
          url: finalUrl,
          volume: tempVolume,
          title: 'Carlos & Jackie — Melodía Nupcial'
        });

        // Apply immediately to engine
        audioEngine.setAudioSource(finalUrl);
        audioEngine.setVolume(tempVolume);

        closeModal();
        showToast('✅ ¡Canción de la boda guardada y actualizada exitosamente!', 'success');
      });
    }
  });
}

