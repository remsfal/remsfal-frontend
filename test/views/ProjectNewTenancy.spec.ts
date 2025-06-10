import { mount, VueWrapper } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import Dialog from 'primevue/dialog';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../../src/i18n/i18n';
import ProjectNewTenancy from '../../src/views/ProjectNewTenancy.vue';

// Mock PrimeVue configuration to avoid errors during testing
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
    wrapper = mount(ProjectNewTenancy, {
      global: {
        plugins: [PrimeVue, i18n],
      },
    });
  });

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });
});
