/**
 * Modal Dialog Controller
 */

export function showModal({ title, bodyHtml, footerHtml = '', onMount = null, onClose = null, maxWidth = '650px' }) {
  const container = document.getElementById('modal-container');
  if (!container) return;

  container.innerHTML = `
    <div class="modal-card" style="max-width: ${maxWidth};">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button id="modal-btn-close" class="modal-close-btn" aria-label="Cerrar">&times;</button>
      </div>
      <div class="modal-body" id="modal-body-content">
        ${bodyHtml}
      </div>
      ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
    </div>
  `;

  container.classList.remove('hidden');

  const closeHandler = () => {
    closeModal();
    if (onClose) onClose();
  };

  const closeBtn = document.getElementById('modal-btn-close');
  if (closeBtn) closeBtn.addEventListener('click', closeHandler);

  // Close when clicking outside modal-card
  container.onclick = (e) => {
    if (e.target === container) {
      closeHandler();
    }
  };

  if (onMount) {
    onMount(container);
  }
}

export function closeModal() {
  const container = document.getElementById('modal-container');
  if (!container) return;
  container.classList.add('hidden');
  container.innerHTML = '';
}
