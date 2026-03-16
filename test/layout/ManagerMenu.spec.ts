import { describe, it, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import ManagerMenu from '@/layout/ManagerMenu.vue';

describe('ManagerMenu.vue', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(ManagerMenu);
  });

  it('renders the sidebar container', () => {
    expect(wrapper.find('.layout-sidebar').exists()).toBe(true);
    expect(wrapper.find('.layout-menu').exists()).toBe(true);
  });

  it('renders two root menu sections', async () => {
    await wrapper.vm.$nextTick();
    const rootItems = wrapper.findAll('.layout-root-menuitem');
    expect(rootItems.length).toBe(2);
  });

  it('renders "Meine Daten" as the first section label', async () => {
    await wrapper.vm.$nextTick();
    const rootItems = wrapper.findAll('.layout-root-menuitem');
    expect(rootItems[0].text()).toContain('Meine Daten');
  });

  it('renders "Organisationen" as the second section label', async () => {
    await wrapper.vm.$nextTick();
    const rootItems = wrapper.findAll('.layout-root-menuitem');
    expect(rootItems[1].text()).toContain('Organisationen');
  });

  it('renders four submenu items under "Meine Daten"', async () => {
    await wrapper.vm.$nextTick();
    const submenus = wrapper.findAll('.layout-submenu');
    expect(submenus[0].findAll('.layout-menuitem-text').length).toBe(4);
  });

  it('renders one submenu item under "Organisationen"', async () => {
    await wrapper.vm.$nextTick();
    const submenus = wrapper.findAll('.layout-submenu');
    expect(submenus[1].findAll('.layout-menuitem-text').length).toBe(1);
  });

  it('renders the expected submenu item labels', async () => {
    await wrapper.vm.$nextTick();
    const labels = wrapper.findAll('.layout-submenu .layout-menuitem-text').map(el => el.text());
    expect(labels).toContain('Meine Übersicht');
    expect(labels).toContain('Meine Liegenschaften');
    expect(labels).toContain('Persönliche Daten');
    expect(labels).toContain('Persönliche Einstellungen');
    expect(labels).toContain('Organisationen anlegen');
  });

  it('renders icons for each menu item', async () => {
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.pi-chart-bar').exists()).toBe(true);
    expect(wrapper.find('.pi-building').exists()).toBe(true);
    expect(wrapper.find('.pi-user').exists()).toBe(true);
    expect(wrapper.find('.pi-cog').exists()).toBe(true);
    expect(wrapper.find('.pi-user-plus').exists()).toBe(true);
  });

  it('navigates to /manager/dashboard when overview item is clicked', async () => {
    await wrapper.vm.$nextTick();
    const pushSpy = vi.spyOn(wrapper.vm.$router, 'push');
    await wrapper.find('.pi-chart-bar').trigger('click');
    expect(pushSpy).toHaveBeenCalledWith('/manager/dashboard');
  });

  it('navigates to /manager/projects when properties item is clicked', async () => {
    await wrapper.vm.$nextTick();
    const pushSpy = vi.spyOn(wrapper.vm.$router, 'push');
    await wrapper.find('.pi-building').trigger('click');
    expect(pushSpy).toHaveBeenCalledWith('/manager/projects');
  });
});
