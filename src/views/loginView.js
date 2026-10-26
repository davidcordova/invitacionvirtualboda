/**
 * Login View - Access Control for Wedding Staff & Couple
 */

import { authService } from '../services/authService.js';
import { showToast } from '../utils/toast.js';

export function renderLoginView(container, options = {}) {
  const redirectTarget = options.redirectTo || '#admin';
  const availableAccounts = authService.getAvailableAccounts();

  container.innerHTML = `
    <div class="auth-page-container">
      <div class="auth-card">
        <!-- Brand Header -->
        <div class="auth-header">
          <div class="auth-icon-badge">🔐</div>
          <h1 class="auth-title">Sistema de Gestión & Acceso</h1>
          <p class="auth-subtitle">Boda Civil de Carlos & Jackie • Villa Venecia</p>
        </div>

        <!-- Login Form -->
        <form id="auth-login-form" class="auth-form">
          <div class="auth-field-group">
            <label for="login-username" class="auth-label">Usuario</label>
            <input 
              type="text" 
              id="login-username" 
              class="auth-input" 
              placeholder="Ej. admin o porteria" 
              autocomplete="username" 
              required
            >
          </div>

          <div class="auth-field-group">
            <label for="login-password" class="auth-label">Contraseña</label>
            <div class="auth-password-wrapper">
              <input 
                type="password" 
                id="login-password" 
                class="auth-input" 
                placeholder="Ingresa tu contraseña" 
                autocomplete="current-password" 
                required
              >
              <button type="button" id="btn-toggle-password" class="auth-pw-toggle" aria-label="Mostrar contraseña">👁️</button>
            </div>
          </div>

          <div id="auth-error-msg" class="auth-alert-error" style="display: none;"></div>

          <button type="submit" class="auth-submit-btn">
            Ingresar al Sistema
          </button>
        </form>

        <!-- Quick Access Profiles (Para máxima practicidad) -->
        <div class="auth-quick-section">
          <div class="auth-divider">
            <span>Perfiles de acceso rápido</span>
          </div>

          <div class="auth-role-cards">
            ${availableAccounts.map(acc => `
              <button type="button" class="auth-role-card" data-user="${acc.username}" data-pass="${acc.password}">
                <div class="role-card-badge">${acc.badge}</div>
                <div class="role-card-name">${acc.displayName}</div>
                <div class="role-card-desc">${acc.description}</div>
                <div class="role-card-action">Entrar con 1 clic →</div>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Footer Back Link -->
        <div class="auth-footer">
          <a href="/" class="auth-back-link">
            ← Volver a la Invitación de Boda
          </a>
        </div>
      </div>
    </div>
  `;

  // Form Submission
  const form = container.querySelector('#auth-login-form');
  const userInput = container.querySelector('#login-username');
  const passInput = container.querySelector('#login-password');
  const errorBox = container.querySelector('#auth-error-msg');
  const togglePwBtn = container.querySelector('#btn-toggle-password');

  // Toggle password visibility
  togglePwBtn?.addEventListener('click', () => {
    if (passInput.type === 'password') {
      passInput.type = 'text';
      togglePwBtn.textContent = '🙈';
    } else {
      passInput.type = 'password';
      togglePwBtn.textContent = '👁️';
    }
  });

  const performLogin = (username, password) => {
    errorBox.style.display = 'none';
    const result = authService.login(username, password);

    if (result.success) {
      showToast(`Bienvenido/a, ${result.user.displayName}`, 'success');
      // Redirect based on role or target
      if (result.user.role === 'porteria') {
        window.location.hash = '#admin';
      } else {
        window.location.hash = redirectTarget.startsWith('#') ? redirectTarget : '#admin';
      }
    } else {
      errorBox.textContent = result.message;
      errorBox.style.display = 'block';
    }
  };

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    performLogin(userInput.value, passInput.value);
  });

  // Quick 1-click login buttons
  container.querySelectorAll('.auth-role-card').forEach(card => {
    card.addEventListener('click', () => {
      const u = card.dataset.user;
      const p = card.dataset.pass;
      userInput.value = u;
      passInput.value = p;
      performLogin(u, p);
    });
  });
}
