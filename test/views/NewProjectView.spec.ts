import { describe, test, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Component from '@/components/NewProjectForm.vue';
import PrimeVue from 'primevue/config'; // Update the import path to the correct path for your component

describe('Component', () => {
  test('renders NewProjectForm properly', () => {
    const wrapper = mount(Component, {
      global: {
        plugins: [PrimeVue],
      },
    });
    expect(wrapper.findComponent({ name: 'NewProjectForm' }).exists());
  });
});
