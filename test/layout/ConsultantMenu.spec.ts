import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ConsultantMenu from '../../src/layout/ConsultantMenu.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';
import { useUserSessionStore } from '../../src/stores/UserSession';

vi.mock('@/stores/UserSession', () => ({
  useUserSessionStore: vi.fn(),
}));

describe('ConsultantMenu.vue', () => {
  let router;
  let sessionStoreMock;
  const pinia = createPinia();

  beforeEach(() => {
    sessionStoreMock = { user: null };
    useUserSessionStore.mockReturnValue(sessionStoreMock);

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/contractor', name: 'contractor', component: { template: '<div>Contractor Page</div>' } },
      ],
    });
  });

  it('should render the correct menu structure', async () => {
    const wrapper = mount(ConsultantMenu, {
      global: {
        plugins: [pinia, router],
      },
    });
  
    await wrapper.vm.$nextTick();
    
    const rootMenuItems = wrapper.findAll('.layout-root-menuitem');
    expect(rootMenuItems.length).toBe(2);
    expect(rootMenuItems[0].text()).toContain('Home');
    expect(rootMenuItems[1].text()).toContain('Auftragsmanagement');
  
    const submenus = wrapper.findAll('.layout-submenu');
    expect(submenus.length).toBe(2);
  });
  

  it('should render the correct menu labels', async () => {
    const wrapper = mount(ConsultantMenu, {
      global: {
        plugins: [pinia, router],
      },
    });
  
    await wrapper.vm.$nextTick();
    const submenuLabels = wrapper.findAll('.layout-submenu .layout-menuitem-text');

    const expectedSubmenuLabels = [
      'Überblick',
      'Auftraggeber',
      'Offene Anfragen',
      'Laufende Aufträge',
      'Abgeschlossene Aufträge',
    ];
  
    expectedSubmenuLabels.forEach((label, index) => {
      expect(submenuLabels[index].text()).toContain(label);
    });
  });
  
  it('should render the correct icons for menu items', async () => {
    const wrapper = mount(ConsultantMenu, {
      global: {
        plugins: [pinia, router],
      },
    });
  
    await wrapper.vm.$nextTick();
  
    const overviewIcon = wrapper.find('.pi-home');
    expect(overviewIcon.exists()).toBe(true);
  
    const clientIcon = wrapper.find('.pi-id-card');
    expect(clientIcon.exists()).toBe(true);
  });
  

  it('should navigate correctly when menu items are clicked', async () => {
    sessionStoreMock.user = { email: 'test@example.com' };
    const pushSpy = vi.spyOn(router, 'push');
    const wrapper = mount(ConsultantMenu, {
      global: {
        plugins: [pinia, router],
      },
    });

    await wrapper.find('.pi-home').trigger('click');
    expect(pushSpy).toHaveBeenCalledWith('/contractor');
  });

});
