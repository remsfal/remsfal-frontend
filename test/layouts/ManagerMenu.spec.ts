import { describe, it, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import ManagerMenu from '@/layouts/components/ManagerMenu.vue';
import { useOrganizationStore } from '@/stores/OrganizationStore';

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

  it('renders five submenu items under "Meine Daten"', async () => {
    await wrapper.vm.$nextTick();
    const submenus = wrapper.findAll('.layout-submenu');
    expect(submenus[0].findAll('.layout-menuitem-text').length).toBe(5);
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

describe('ManagerMenu.vue — with organization', () => {
  const mockOrg = { id: 'org-abc', name: 'Muster GmbH' };
  let wrapper: VueWrapper;
  let orgStore: ReturnType<typeof useOrganizationStore>;

  beforeEach(async () => {
    wrapper = mount(ManagerMenu);
    // Use the same testing-Pinia the component uses; bypass action stubs via direct assignment
    orgStore = useOrganizationStore();
    orgStore.userOrganizations = [mockOrg];
    orgStore.initialized = true;
    await wrapper.vm.$nextTick();
  });

  it('renders three root menu sections when user has an organization', () => {
    const rootItems = wrapper.findAll('.layout-root-menuitem');
    expect(rootItems.length).toBe(3);
  });

  it('shows the organization name as the third section label', () => {
    const rootItems = wrapper.findAll('.layout-root-menuitem');
    expect(rootItems[2].text()).toContain('Muster GmbH');
  });

  it('renders "Einstellungen" as submenu item under the org section', () => {
    const submenus = wrapper.findAll('.layout-submenu');
    expect(submenus[2].text()).toContain('Einstellungen');
  });

  it('links org settings to the correct URL including org id', () => {
    const orgSettingsLink = wrapper.findAll('.layout-submenu').at(2)?.find('a');
    expect(orgSettingsLink?.attributes('href')).toContain('org-abc');
  });

  it('renders four sections when user belongs to two organizations', async () => {
    orgStore.userOrganizations = [mockOrg, { id: 'org-xyz', name: 'Zweite GmbH' }];
    await wrapper.vm.$nextTick();

    const rootItems = wrapper.findAll('.layout-root-menuitem');
    expect(rootItems.length).toBe(4);
  });
});
