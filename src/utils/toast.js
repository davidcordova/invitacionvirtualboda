/**
 * Toast Notification Utility
 */

let container = null;

function getToastContainer() {
  if (!container || !document.body.contains(container)) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(message, type = 'info', duration = 3500) {
  const toastMount = getToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: '✨',
    error: '⚠️',
    warning: '🔔',
    info: '💍'
  };

  toast.innerHTML = `
    <span class="toast-icon" style="font-size: 1.2rem;">${iconMap[type] || '💍'}</span>
    <span class="toast-text" style="flex: 1; line-height: 1.4;">${message}</span>
  `;

  toastMount.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 400);
  }, duration);
}
