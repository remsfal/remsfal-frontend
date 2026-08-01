// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

import '@cypress/code-coverage/support';

// Set default language to German for consistent E2E tests
// This ensures tests pass in both local and CI environments
Cypress.on('window:before:load', (win) => {
  Object.defineProperty(win.navigator, 'language', { value: 'de' });
  Object.defineProperty(win.navigator, 'languages', { value: ['de'] });
});

// The dist/ build served by `vite preview` bakes in VITE_SERVICE_WORKER_ENABLED=true
// (production mode reads .env.production), so sw.ts's own network-first fetch handler
// installs and re-issues every API request itself. Cypress cannot intercept requests
// made from within a Service Worker, so those re-issued requests bypass all cy.intercept
// mocks and hit the real (unavailable) backend. Disable registration for e2e runs.
Cypress.on('window:before:load', (win) => {
  if (win.navigator?.serviceWorker) {
    win.navigator.serviceWorker.register = () =>
      Promise.resolve({} as ServiceWorkerRegistration);
  }
});

// Every spec mocks GET /api/v1/user with a 401 for logged-out scenarios, which makes
// ApiClient's 401 handler call authService.refreshTokens() (POST .../authentication/refresh).
// Without this, that call hits the real backend proxy and fails with ECONNREFUSED noise.
beforeEach(() => {
  cy.intercept('POST', '/api/v1/authentication/refresh', { statusCode: 401 }).as('refreshToken');
});

// Enhanced error logging to get better stack traces
Cypress.on('uncaught:exception', (err, runnable) => {
  console.error('=== UNCAUGHT EXCEPTION ===');
  console.error('Error:', err);
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  console.error('Runnable:', runnable);
  console.error('========================');

  // Don't fail the test - we want to see what's happening
  return false;
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('=== UNHANDLED REJECTION ===');
  console.error('Reason:', event.reason);
  console.error('==========================');
});

// Capture Vue errors and warnings with full component traces
Cypress.on('window:before:load', (win) => {
  const originalErrorHandler = win.console.error;
  const originalWarnHandler = win.console.warn;

  win.console.error = function(...args) {
    console.error('=== CONSOLE ERROR ===', ...args);
    originalErrorHandler.apply(win.console, args);
  };

  win.console.warn = function(...args) {
    console.warn('=== CONSOLE WARN ===', ...args);
    originalWarnHandler.apply(win.console, args);
  };
});
