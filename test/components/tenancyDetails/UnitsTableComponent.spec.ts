import { mount, VueWrapper } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UnitsTableComponent from '../../../src/components/tenancyDetails/UnitsTableComponent.vue';

// Mock PrimeVue configuration  to avoid errors during testing
vi.mock('primevue/config', () => ({
  default: {
    install: () => {},
    locale: 'en',
  },
}));

describe('ProjectTenancies.vue', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    // Mount the component with PrimeVue plugin mocked
    wrapper = mount(UnitsTableComponent, {
      global: {
        plugins: [PrimeVue],
      },
    });
  });

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });
});
