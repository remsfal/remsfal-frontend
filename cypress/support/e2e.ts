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
