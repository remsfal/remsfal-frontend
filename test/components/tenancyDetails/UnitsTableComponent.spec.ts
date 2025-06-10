import { mount, VueWrapper } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import Dialog from 'primevue/dialog';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UnitsTableComponent from '../../../src/components/tenancyDetails/UnitsTableComponent.vue';

// Mock PrimeVue configuration and Dialog component to avoid errors during testing
vi.mock('primevue/config', () => ({
  default: {
    install: () => {},
    locale: 'en',
  },
}));

vi.mock('primevue/dialog', () => ({
  default: {
    inheritAttrs: false, // Prevents the passing of extraneous attributes to the root element
    render: () => '<div class="mock-dialog"></div>', // Mock rendering
  },
}));

describe('ProjectTenancies.vue', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    // Mount the component with PrimeVue plugin and Dialog component mocked
    wrapper = mount(UnitsTableComponent, {
      global: {
        plugins: [PrimeVue],
        components: {
          Dialog,
        },
      },
    });
  });

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });
});
