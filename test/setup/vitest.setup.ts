import { config } from '@vue/test-utils';
import { vi } from 'vitest';
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
  createTestingPinia(),
  router,
  i18n,
];

config.global.directives = {
  badge: BadgeDirective,
  ripple: Ripple,
  styleclass: StyleClass,
  tooltip: Tooltip,
};
