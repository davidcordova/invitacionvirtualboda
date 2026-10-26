/**
 * Main Application Router & Orchestrator — Carlos & Jackie Wedding
 */

import { renderAdminView } from './views/adminView.js';
import { renderLandingView } from './views/landingView.js';
import { renderCheckinView, stopScanner } from './views/checkinView.js';
import { renderLoginView } from './views/loginView.js';
import { authService } from './services/authService.js';
import { autoScrollController } from './utils/autoScroll.js';

const appRoot = document.getElementById('app-root');
let currentView = 'landing';

function init() {
  // Listen for hash changes
  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('popstate', handleRoute);

  // Initial route execution
  handleRoute();
}

function handleRoute() {
  const hash = window.location.hash || '';
  const search = window.location.search || '';
  
  // Extract token from either query params (?inv=...) or hash (#inv=... or #...?inv=...)
  let invToken = null;

  // 1. Check window.location.search (?inv=CODIGO)
  if (search) {
    const searchParams = new URLSearchParams(search);
    if (searchParams.get('inv')) {
      invToken = searchParams.get('inv');
    }
  }

  // 2. Check hash (#admin, #checkin, #inv=CODIGO, #invitacion?inv=CODIGO)
  const cleanHash = hash.replace(/^#/, '');
  const [routePath, queryString] = cleanHash.split('?');
  const hashParams = new URLSearchParams(queryString || '');

  if (!invToken) {
    if (hashParams.get('inv')) {
      invToken = hashParams.get('inv');
    } else if (cleanHash.startsWith('inv=')) {
      invToken = cleanHash.split('inv=')[1];
    }
  }

  // Route decisions
  if (routePath === 'login') {
    if (currentView === 'checkin') stopScanner();
    autoScrollController.destroy();
    currentView = 'login';
    renderLoginView(appRoot, { redirectTo: hashParams.get('redirect') || '#admin' });
  } else if (routePath === 'logout') {
    if (currentView === 'checkin') stopScanner();
    autoScrollController.destroy();
    authService.logout();
    window.location.hash = '#login';
  } else if (routePath === 'admin') {
    // Check authentication guard
    if (!authService.isAuthenticated()) {
      if (currentView === 'checkin') stopScanner();
      autoScrollController.destroy();
      currentView = 'login';
      renderLoginView(appRoot, { redirectTo: '#admin' });
      return;
    }
    if (currentView === 'checkin') stopScanner();
    autoScrollController.destroy();
    currentView = 'admin';
    const highlightToken = hashParams.get('highlight');
    renderAdminView(appRoot, { highlightToken });
  } else if (routePath === 'checkin') {
    // Check authentication guard
    if (!authService.isAuthenticated()) {
      if (currentView === 'checkin') stopScanner();
      autoScrollController.destroy();
      currentView = 'login';
      renderLoginView(appRoot, { redirectTo: '#checkin' });
      return;
    }
    autoScrollController.destroy();
    currentView = 'checkin';
    renderCheckinView(appRoot, invToken);
  } else {
    // Default & Root: Pristine Clean Standalone Landing Page
    if (currentView === 'checkin') stopScanner();
    currentView = 'landing';
    renderLandingView(appRoot, invToken);
  }
}

// Start application
document.addEventListener('DOMContentLoaded', init);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  init();
}
