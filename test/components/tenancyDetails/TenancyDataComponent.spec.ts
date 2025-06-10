import { mount, VueWrapper } from '@vue/test-utils';
import { DatePicker } from 'primevue';
import PrimeVue from 'primevue/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TenancyDataComponent from '../../../src/components/tenancyDetails/TenancyDataComponent.vue';

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
    wrapper = mount(TenancyDataComponent, {
      global: {
        plugins: [PrimeVue],
      },
      components: {
        DatePicker,
      },
      props: {
        tenancy: {
          id: '1',
          name: 'Test Tenancy',
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          status: 'active',
          projectId: '123',
        },
      },
    });
  });

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });
});
