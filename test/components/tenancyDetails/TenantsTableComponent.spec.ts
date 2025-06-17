import { mount, VueWrapper } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TenantsTableComponent from '../../../src/components/tenancyDetails/TenantsTableComponent.vue';

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
    wrapper = mount(TenantsTableComponent, {
      global: {
        plugins: [PrimeVue],
      },
    });
  });

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });
});
