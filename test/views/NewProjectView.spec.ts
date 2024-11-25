import { describe, it, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import NewProjectView from '@/views/NewProjectView.vue';
import PrimeVue from 'primevue/config';
import router from '../../src/router';

describe('Component', () => {
  let wrapper: VueWrapper<NewProjectView>;

  beforeEach(() => {
    wrapper = mount(NewProjectView, {
      global: {
        plugins: [PrimeVue, router],
        stubs: {
          NewProjectForm: true,
        },
      },
    });
  });

  it('renders NewProjectView properly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('renders NewProjectForm properly', () => {
    expect(wrapper.findComponent({ name: 'NewProjectForm' }).exists()).toBe(true);
  });
});
