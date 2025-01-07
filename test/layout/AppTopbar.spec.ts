import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AppTopbar from '../../src/layout/AppTopbar.vue';
import PrimeVue from 'primevue/config';
import router from '@/router';
import { createPinia } from 'pinia';
import { useUserSessionStore } from '@/stores/UserSession';
import i18n from "../../src/i18n/i18n";

vi.mock('@/stores/UserSession', () => ({
  useUserSessionStore: vi.fn(),
}));

describe('AppTopbar.vue', () => {
  let sessionStoreMock;
  const pinia = createPinia();

  beforeEach(() => {
    sessionStoreMock = { user: null };
    useUserSessionStore.mockReturnValue(sessionStoreMock);
  });

  it('zeigt den Anmelde-Button an, wenn der Benutzer nicht eingeloggt ist', () => {
    const wrapper = mount(AppTopbar, {
      global: {
        plugins: [PrimeVue, pinia, router, i18n],
      },
    });
    expect(wrapper.find('.pi-sign-in').exists()).toBe(true);
    expect(wrapper.find('.pi-sign-out').exists()).toBe(false);
  });

  it('zeigt den Abmelde-Button an, wenn der Benutzer eingeloggt ist', () => {
    sessionStoreMock.user = { email: 'test@example.com' };
    const wrapper = mount(AppTopbar, {
      global: {
        plugins: [PrimeVue, pinia, router, i18n],
      },
    });
    expect(wrapper.find('.pi-sign-out').exists()).toBe(true);
    expect(wrapper.find('.pi-sign-in').exists()).toBe(false);
  });

  it('navigiert zu den Kontoeinstellungen bei Klick auf den Kontoeinstellungen-Button', async () => {
    sessionStoreMock.user = { email: 'test@example.com' };
    const pushSpy = vi.spyOn(router, 'push');
    const wrapper = mount(AppTopbar, {
      global: {
        plugins: [PrimeVue, pinia, router, i18n],
      },
    });

    await wrapper.find('.pi-user').trigger('click');
    expect(pushSpy).toHaveBeenCalledWith('/account-settings');
  });

  it('navigiert zur Projektübersicht bei Klick auf den Home-Button', async () => {
    sessionStoreMock.user = { email: 'test@example.com' };
    const pushSpy = vi.spyOn(router, 'push');
    const wrapper = mount(AppTopbar, {
      global: {
        plugins: [PrimeVue, pinia, router, i18n],
      },
    });

    await wrapper.find('.pi-home').trigger('click');
    expect(pushSpy).toHaveBeenCalledWith('/projects');
  });
});

