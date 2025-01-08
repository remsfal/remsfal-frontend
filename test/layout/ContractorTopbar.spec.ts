import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ContractorTopbar from '../../src/layout/ContractorTopbar.vue';
import { createPinia } from 'pinia';
import { useUserSessionStore } from '../../src/stores/UserSession';
import PrimeVue from 'primevue/config';

vi.mock('@/stores/UserSession', () => ({
  useUserSessionStore: vi.fn(),
}));

describe('ContractorTopbar.vue', () => {
  let sessionStoreMock;
  const pinia = createPinia();

  beforeEach(() => {
    sessionStoreMock = { user: null };
    useUserSessionStore.mockReturnValue(sessionStoreMock);
  });

  it('should display the login button when the user is not logged in', () => {
    const wrapper = mount(ContractorTopbar, {
      global: {
        plugins: [PrimeVue, pinia],
      },
    });
    expect(wrapper.find('.pi-sign-in').exists()).toBe(true);
    expect(wrapper.find('.pi-sign-out').exists()).toBe(false);
  });

  it('should display the logout button when the user is logged in', () => {
    sessionStoreMock.user = { email: 'test@example.com' };
    const wrapper = mount(ContractorTopbar, {
      global: {
        plugins: [PrimeVue, pinia],
      },
    });
    expect(wrapper.find('.pi-sign-out').exists()).toBe(true);
    expect(wrapper.find('.pi-sign-in').exists()).toBe(false);
  });

  it('should toggle the topbar menu when the menu button is clicked', async () => {
    const wrapper = mount(ContractorTopbar, {
      global: {
        plugins: [PrimeVue, pinia],
      },
    });
    
    expect(wrapper.find('.layout-topbar-menu').classes()).not.toContain('layout-topbar-menu-mobile-active');

    await wrapper.find('.layout-topbar-menu-button').trigger('click');
    expect(wrapper.find('.layout-topbar-menu').classes()).toContain('layout-topbar-menu-mobile-active');

    await wrapper.find('.layout-topbar-menu-button').trigger('click');
    expect(wrapper.find('.layout-topbar-menu').classes()).not.toContain('layout-topbar-menu-mobile-active');
  });
});
