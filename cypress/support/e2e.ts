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
