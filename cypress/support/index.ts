// Import commands.js using ES2015 syntax:
import './commands'

import '@cypress/code-coverage/support';

Cypress.on('uncaught:exception', (err) => {
  // Stacktrace in der Cypress-Konsole anzeigen
  console.error('Uncaught Exception:', err);
  return false; // Test nicht abbrechen
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Rejection:', event.reason);
});
