/**
 * Authentication & Role-Based Access Control (RBAC)
 * Roles:
 *  - 'admin': Novios & Wedding Planner (Acceso total al sistema)
 *  - 'porteria': Seguridad & Recepción (Lista de invitados de solo lectura + Escáner QR)
 */

const AUTH_STORAGE_KEY = 'boda_carlos_jackie_auth_user';

// Credenciales preconfiguradas
const SYSTEM_USERS = [
  {
    username: 'admin',
    password: '123',
    role: 'admin',
    displayName: 'Carlos & Jackie (Novios / Organizadora)',
    badge: '👑 Administrador',
    description: 'Control total de invitados, reportes, edición, exportación y escaneo.'
  },
  {
    username: 'organizadora',
    password: '123',
    role: 'admin',
    displayName: 'Wedding Planner / Organizadora',
    badge: '📋 Organizadora',
    description: 'Acceso completo para gestión, mesas, pases y métricas.'
  },
  {
    username: 'porteria',
    password: '123',
    role: 'porteria',
    displayName: 'Control de Puerta & Recepción',
    badge: '🛡️ Portería / Seguridad',
    description: 'Acceso exclusivo para verificar lista y escanear pases QR en puerta.'
  }
];

class AuthService {
  constructor() {
    this.currentUser = this.loadUser();
  }

  loadUser() {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin';
  }

  isPorteria() {
    return this.currentUser && this.currentUser.role === 'porteria';
  }

  login(username, password) {
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    const matched = SYSTEM_USERS.find(
      u => u.username.toLowerCase() === cleanUser && u.password === cleanPass
    );

    if (matched) {
      this.currentUser = {
        username: matched.username,
        role: matched.role,
        displayName: matched.displayName,
        badge: matched.badge,
        loginAt: new Date().toISOString()
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
      return { success: true, user: this.currentUser };
    }

    return { 
      success: false, 
      message: 'Usuario o contraseña incorrectos. Revisa los datos de acceso.' 
    };
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  getAvailableAccounts() {
    return SYSTEM_USERS.map(u => ({
      username: u.username,
      password: u.password,
      role: u.role,
      displayName: u.displayName,
      badge: u.badge,
      description: u.description
    }));
  }
}

export const authService = new AuthService();
