import { describe, it, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import TenantMenu from '@/layouts/components/TenantMenu.vue';

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
    expect(rootItems.length).toBe(3);
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
    expect(submenus[0].findAll('.layout-menuitem-text').length).toBe(2);
  });

  it('renders one submenu item under "Einstellungen"', async () => {
    await wrapper.vm.$nextTick();
    const submenus = wrapper.findAll('.layout-submenu');
    expect(submenus[1].findAll('.layout-menuitem-text').length).toBe(1);
  });

  it('renders two submenu items under "Weitere Leistungen"', async () => {
    await wrapper.vm.$nextTick();
    const submenus = wrapper.findAll('.layout-submenu');
    expect(submenus[2].findAll('.layout-menuitem-text').length).toBe(2);
  });

  it('renders expected submenu item labels', async () => {
    await wrapper.vm.$nextTick();
    const labels = wrapper.findAll('.layout-submenu .layout-menuitem-text').map(el => el.text());
    expect(labels).toContain('Überblick');
    expect(labels).toContain('Meldungen');
    expect(labels).toContain('Persönliche Daten');
    expect(labels).toContain('Meine Immobilien');
    expect(labels).toContain('Meine Aufträge');
  });

  it('renders icons for menu items', async () => {
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.pi-info-circle').exists()).toBe(true);
    expect(wrapper.find('.pi-list').exists()).toBe(true);
    expect(wrapper.find('.pi-user').exists()).toBe(true);
    expect(wrapper.find('.pi-home').exists()).toBe(true);
    expect(wrapper.find('.pi-wrench').exists()).toBe(true);
  });

  it('navigates to /tenancies/dashboard when overview is clicked', async () => {
    await wrapper.vm.$nextTick();
    const pushSpy = vi.spyOn(wrapper.vm.$router, 'push');
    await wrapper.find('.pi-info-circle').trigger('click');
    expect(pushSpy).toHaveBeenCalledWith('/tenancies/dashboard');
  });

  it('navigates to /tenancies/account-settings when personal data is clicked', async () => {
    await wrapper.vm.$nextTick();
    const pushSpy = vi.spyOn(wrapper.vm.$router, 'push');
    await wrapper.find('.pi-user').trigger('click');
    expect(pushSpy).toHaveBeenCalledWith('/tenancies/account-settings');
  });
});
