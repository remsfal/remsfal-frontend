import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '@/App.vue';
import PrimeVue from 'primevue/config';


vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/' }),
  RouterView: { template: '<div id="router-view" />' }
}));

describe('App.vue', () => {
  it('renders the MobileNavBar component', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [PrimeVue],
        stubs: {
          Toast: true,
          ConfirmDialog: true,
          DynamicDialog: true
        }
      }
    });

    const mobileNav = wrapper.find('.layout-mobile-navbar');
    expect(mobileNav.exists()).toBe(true);
  });
});