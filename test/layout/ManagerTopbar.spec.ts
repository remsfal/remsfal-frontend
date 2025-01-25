import { mount, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ManagerTopbar from '../../src/layout/ManagerTopbar.vue';
import PrimeVue from 'primevue/config';
import router from '../../src/router';
import { createPinia, setActivePinia } from 'pinia';
import { useUserSessionStore } from '../../src/stores/UserSession';
import i18n from '../../src/i18n/i18n';
import Ripple from 'primevue/ripple';

vi.mock('@/stores/UserSession', () => ({
  useUserSessionStore: vi.fn(),
}));

describe('ManagerTopbar.vue', () => {
  let wrapper: VueWrapper;
  let sessionStoreMock;

  beforeEach(() => {
//    const pinia = createPinia();
  //  setActivePinia(pinia);

    sessionStoreMock = { user: null };
    useUserSessionStore.mockReturnValue(sessionStoreMock);
  });

  it('zeigt den Anmelde-Button an, wenn der Benutzer nicht eingeloggt ist', () => {
    const wrapper = mount(ManagerTopbar, {
 //     global: {
   //     plugins: [PrimeVue, pinia, router, i18n],
     // },
    });
    expect(wrapper.find('.pi-sign-in').exists()).toBe(true);
    expect(wrapper.find('.pi-sign-out').exists()).toBe(false);
  });

  it('zeigt den Abmelde-Button an, wenn der Benutzer eingeloggt ist', () => {
    sessionStoreMock.user = { email: 'test@example.com' };
    const wrapper = mount(ManagerTopbar, {
//      global: {
  //      plugins: [PrimeVue, pinia, router, i18n],
    //  },
    });
    expect(wrapper.find('.pi-sign-out').exists()).toBe(true);
    expect(wrapper.find('.pi-sign-in').exists()).toBe(false);
  });

  it('navigiert zu den Kontoeinstellungen bei Klick auf den Kontoeinstellungen-Button', async () => {
    sessionStoreMock.user = { email: 'test@example.com' };
    const pushSpy = vi.spyOn(router, 'push');
    const wrapper = mount(ManagerTopbar, {
 //     global: {
   //     plugins: [PrimeVue, pinia, router, i18n],
     //   directives: { ripple: Ripple },
      //},
    });

    await wrapper.find('.pi-user').trigger('click');
    expect(pushSpy).toHaveBeenCalledWith('/account-settings');
  });

  it('navigiert zur Projektübersicht bei Klick auf den Home-Button', async () => {
    sessionStoreMock.user = { email: 'test@example.com' };
    const pushSpy = vi.spyOn(router, 'push');
    const wrapper = mount(ManagerTopbar, {
 //     global: {
   //     plugins: [PrimeVue, pinia, router, i18n],
     // },
    });

    await wrapper.find('.pi-home').trigger('click');
    expect(pushSpy).toHaveBeenCalledWith('/projects');
  });
});
