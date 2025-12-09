import { config } from '@vue/test-utils';
import { vi, beforeAll } from 'vitest';
import PrimeVue from 'primevue/config';
import router from '../../src/router';
import i18n from '../../src/i18n/i18n';
import { createTestingPinia } from '@pinia/testing';
import BadgeDirective from 'primevue/badgedirective';
import Ripple from 'primevue/ripple';
import StyleClass from 'primevue/styleclass';
import Tooltip from 'primevue/tooltip';
import ToastService from 'primevue/toastservice';
import DialogService from 'primevue/dialogservice';
import ConfirmationService from 'primevue/confirmationservice';

beforeAll(() => {
  i18n.global.locale.value = 'de'
})

// Set up MSW server globally
import '../mocks/setupTests';

// Suppress expected console errors and warnings in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args: unknown[]) => {
  const message = String(args[0]);
  // Suppress expected Axios response errors (these are intentional in error handling tests)
  if (message === '[response error]' || message.includes('AxiosError')) {
    return;
  }
  originalConsoleError.apply(console, args);
};

console.warn = (...args: unknown[]) => {
  const message = String(args[0]);
  // Suppress MSW warnings about unhandled requests (tests use vi.fn() mocks)
  if (message.includes('[MSW]') || message.includes('intercepted a request')) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // für ältere APIs
      removeListener: vi.fn(),
      addEventListener: vi.fn(), // moderne APIs
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  },
});

config.global.plugins = [
  PrimeVue,
  ToastService,
  DialogService,
  ConfirmationService,
  createTestingPinia({ createSpy: vi.fn }),
  router,
  i18n,
];

config.global.directives = {
  badge: BadgeDirective,
  ripple: Ripple,
  styleclass: StyleClass,
  tooltip: Tooltip,
};
