import { defineConfig } from 'cypress';
import codeCoverageTask from '@cypress/code-coverage/task';

export default defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:4173',
    viewportWidth: 1280,
    viewportHeight: 900,
    // Timeout of cy.wait() for an intercepted request (default 5 s). The tests run against
    // `vite dev`, which compiles a lazily loaded view on its first visit, so the first request
    // of a view can take longer than 5 s on slow (self-hosted) runners.
    requestTimeout: 15000,
    setupNodeEvents(on, config) {
      codeCoverageTask(on, config);
      return config;
    },
  },
});
