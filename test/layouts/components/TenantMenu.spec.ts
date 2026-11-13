import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import TenantMenu from '@/layouts/components/TenantMenu.vue';
import { useUserSessionStore } from '@/stores/UserSession';

describe('TenantMenu.vue', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(TenantMenu);
  });

  it('renders the sidebar container', () => {
    expect(wrapper.find('.layout-sidebar').exists()).toBe(true);
    expect(wrapper.find('.layout-menu').exists()).toBe(true);
  });

  it('renders three root menu sections', async () => {
    await wrapper.vm.$nextTick();
    const rootItems = wrapper.findAll('.layout-root-menuitem');
    expect(rootItems).toHaveLength(3);
  });

  it('renders "Mietverhältnisse" as the first section label', async () => {
    await wrapper.vm.$nextTick();
    const rootItems = wrapper.findAll('.layout-root-menuitem');
    expect(rootItems[0].text()).toContain('Mietverhältnisse');
  });

  it('renders "Einstellungen" as the second section label', async () => {
    await wrapper.vm.$nextTick();
    const rootItems = wrapper.findAll('.layout-root-menuitem');
    expect(rootItems[1].text()).toContain('Einstellungen');
  });

  it('renders "Weitere Leistungen" as the third section label', async () => {
    await wrapper.vm.$nextTick();
    const rootItems = wrapper.findAll('.layout-root-menuitem');
    expect(rootItems[2].text()).toContain('Weitere Leistungen');
  });

  it('renders two submenu items under "Mietverhältnisse"', async () => {
    await wrapper.vm.$nextTick();
    const submenus = wrapper.findAll('.layout-submenu');
    expect(submenus[0].findAll('.layout-menuitem-text')).toHaveLength(2);
  });

  it('renders one submenu item under "Einstellungen"', async () => {
    await wrapper.vm.$nextTick();
    const submenus = wrapper.findAll('.layout-submenu');
    expect(submenus[1].findAll('.layout-menuitem-text')).toHaveLength(1);
  });

  it('renders two submenu items under "Weitere Leistungen" for a user without contractor context', async () => {
    await wrapper.vm.$nextTick();
    const submenus = wrapper.findAll('.layout-submenu');
    expect(submenus[2].findAll('.layout-menuitem-text').map((el) => el.text()))
      .toEqual(['Eigene Immobilien', 'Meine Organisationen']);
  });

  it('renders "Zur Auftragsverwaltung" as third item for a user with contractor context', async () => {
    useUserSessionStore().user = {
      id: 'user-1', email: 'test@example.com', userContexts: ['TENANT', 'CONTRACTOR'] 
    };
    await wrapper.vm.$nextTick();
    const submenus = wrapper.findAll('.layout-submenu');
    expect(submenus[2].findAll('.layout-menuitem-text').map((el) => el.text()))
      .toEqual(['Eigene Immobilien', 'Meine Organisationen', 'Zur Auftragsverwaltung']);
  });

  it('renders expected submenu item labels', async () => {
    await wrapper.vm.$nextTick();
    const labels = wrapper.findAll('.layout-submenu .layout-menuitem-text').map(el => el.text());
    expect(labels).toContain('Überblick');
    expect(labels).toContain('Meldungen');
    expect(labels).toContain('Persönliche Daten');
    expect(labels).toContain('Eigene Immobilien');
    expect(labels).toContain('Meine Organisationen');
  });

  it('renders icons for menu items', async () => {
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.pi-info-circle').exists()).toBe(true);
    expect(wrapper.find('.pi-list').exists()).toBe(true);
    expect(wrapper.find('.pi-user').exists()).toBe(true);
    expect(wrapper.find('.pi-home').exists()).toBe(true);
    expect(wrapper.find('.pi-wrench').exists()).toBe(true);
  });

  it('navigates to /tenant/dashboard when overview is clicked', async () => {
    await wrapper.vm.$nextTick();
    const pushSpy = vi.spyOn(wrapper.vm.$router, 'push');
    await wrapper.find('.pi-info-circle').trigger('click');
    expect(pushSpy).toHaveBeenCalledWith('/tenant/dashboard');
  });

  it('navigates to /tenant/account-data when personal data is clicked', async () => {
    await wrapper.vm.$nextTick();
    const pushSpy = vi.spyOn(wrapper.vm.$router, 'push');
    await wrapper.find('.pi-user').trigger('click');
    expect(pushSpy).toHaveBeenCalledWith('/tenant/account-data');
  });

  it('navigates to the tenant own properties page when own properties is clicked', async () => {
    await wrapper.vm.$nextTick();
    const pushSpy = vi.spyOn(wrapper.vm.$router, 'push');
    await wrapper.find('.pi-home').trigger('click');
    expect(pushSpy).toHaveBeenCalledWith('/tenant/properties');
  });

  it('navigates to the tenant organizations page when my organizations is clicked', async () => {
    await wrapper.vm.$nextTick();
    const pushSpy = vi.spyOn(wrapper.vm.$router, 'push');
    await wrapper.find('.pi-wrench').trigger('click');
    expect(pushSpy).toHaveBeenCalledWith('/tenant/organizations');
  });

  it('switches to the contractor view when "Zur Auftragsverwaltung" is clicked', async () => {
    useUserSessionStore().user = {
      id: 'user-1', email: 'test@example.com', userContexts: ['CONTRACTOR'] 
    };
    await wrapper.vm.$nextTick();
    const pushSpy = vi.spyOn(wrapper.vm.$router, 'push');
    await wrapper.find('.pi-briefcase').trigger('click');
    expect(pushSpy).toHaveBeenCalledWith('/contractor/dashboard');
  });
});
