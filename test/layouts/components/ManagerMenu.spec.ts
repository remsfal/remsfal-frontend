import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import ManagerMenu from '@/layouts/components/ManagerMenu.vue';
import { useOrganizationStore } from '@/features/common/organizations/stores/OrganizationStore';
import { useUserSessionStore } from '@/stores/UserSession';

describe('ManagerMenu.vue', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    // Prevent fetchUserOrganization from running so userOrganizations stays empty
    const orgStore = useOrganizationStore();
    vi.spyOn(orgStore, 'fetchUserOrganization').mockResolvedValue();
    wrapper = mount(ManagerMenu);
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

  it('renders the business section first, then personal data, then further services', async () => {
    await wrapper.vm.$nextTick();
    const rootItems = wrapper.findAll('.layout-root-menuitem');
    expect(rootItems[0].text()).toContain('Liegenschaftsverwaltung');
    expect(rootItems[1].text()).toContain('Meine Daten');
    expect(rootItems[2].text()).toContain('Weitere Leistungen');
  });

  it('renders four submenu items under "Liegenschaftsverwaltung"', async () => {
    await wrapper.vm.$nextTick();
    const submenus = wrapper.findAll('.layout-submenu');
    expect(submenus[0].findAll('.layout-menuitem-text')).toHaveLength(4);
  });

  it('renders two submenu items under "Meine Daten" for a user without tenancy', async () => {
    await wrapper.vm.$nextTick();
    const submenus = wrapper.findAll('.layout-submenu');
    expect(submenus[1].findAll('.layout-menuitem-text')).toHaveLength(2);
    expect(wrapper.text()).not.toContain('Persönliche Mietverhältnisse');
  });

  it('renders only "Organisationen anlegen" under "Weitere Leistungen" for a user without contractor context', async () => {
    await wrapper.vm.$nextTick();
    const submenus = wrapper.findAll('.layout-submenu');
    expect(submenus[2].findAll('.layout-menuitem-text').map((el) => el.text()))
      .toEqual(['Organisationen anlegen']);
  });

  it('renders "Zur Auftragsverwaltung" above "Organisationen anlegen" for a user with contractor context', async () => {
    useUserSessionStore().user = {
      id: 'user-1', email: 'test@example.com', userContexts: ['MANAGER', 'CONTRACTOR'] 
    };
    await wrapper.vm.$nextTick();
    const submenus = wrapper.findAll('.layout-submenu');
    expect(submenus[2].findAll('.layout-menuitem-text').map((el) => el.text()))
      .toEqual(['Zur Auftragsverwaltung', 'Organisationen anlegen']);
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

  it('shows "Persönliche Mietverhältnisse" linking to the tenant view for a user with tenant context', async () => {
    useUserSessionStore().user = {
      id: 'user-1', email: 'test@example.com', userContexts: ['MANAGER', 'TENANT'] 
    };
    await wrapper.vm.$nextTick();

    const submenus = wrapper.findAll('.layout-submenu');
    expect(submenus[1].findAll('.layout-menuitem-text')).toHaveLength(3);
    const pushSpy = vi.spyOn(wrapper.vm.$router, 'push');
    await wrapper.find('.pi-key').trigger('click');
    expect(pushSpy).toHaveBeenCalledWith('/tenant/dashboard');
  });

  it('renders the expected submenu item labels', async () => {
    await wrapper.vm.$nextTick();
    const labels = wrapper.findAll('.layout-submenu .layout-menuitem-text').map(el => el.text());
    expect(labels).toContain('Meine Übersicht');
    expect(labels).toContain('Neueste Aktivitäten');
    expect(labels).toContain('Meine Liegenschaften');
    expect(labels).toContain('Persönliche Daten');
    expect(labels).toContain('Persönliche Einstellungen');
    expect(labels).toContain('Organisationen anlegen');
  });

  it('renders icons for each menu item', async () => {
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.pi-chart-bar').exists()).toBe(true);
    expect(wrapper.find('.pi-bell').exists()).toBe(true);
    expect(wrapper.find('.pi-building').exists()).toBe(true);
    expect(wrapper.find('.pi-user').exists()).toBe(true);
    expect(wrapper.find('.pi-user-edit').exists()).toBe(true);
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

  it('navigates to /manager/activity-feeds when activity feeds item is clicked', async () => {
    await wrapper.vm.$nextTick();
    const pushSpy = vi.spyOn(wrapper.vm.$router, 'push');
    await wrapper.find('.pi-bell').trigger('click');
    expect(pushSpy).toHaveBeenCalledWith('/manager/activity-feeds');
  });
});

describe('ManagerMenu.vue — with organization', () => {
  const mockOrg = { id: 'org-abc', name: 'Muster GmbH' };
  let wrapper: VueWrapper;
  let orgStore: ReturnType<typeof useOrganizationStore>;

  beforeEach(async () => {
    orgStore = useOrganizationStore();
    // Mock the action so we control the store state explicitly
    vi.spyOn(orgStore, 'fetchUserOrganization').mockResolvedValue();
    wrapper = mount(ManagerMenu);
    orgStore.userOrganizations = [mockOrg];
    orgStore.initialized = true;
    await wrapper.vm.$nextTick();
  });

  it('renders four root menu sections when user has an organization', () => {
    const rootItems = wrapper.findAll('.layout-root-menuitem');
    expect(rootItems).toHaveLength(4);
  });

  it('shows the organization name as the fourth section label', () => {
    const rootItems = wrapper.findAll('.layout-root-menuitem');
    expect(rootItems[3].text()).toContain('Muster GmbH');
  });

  it('renders "Einstellungen" as submenu item under the org section', () => {
    const submenus = wrapper.findAll('.layout-submenu');
    expect(submenus[3].text()).toContain('Einstellungen');
  });

  it('links org settings to the correct URL including org id', () => {
    const orgSettingsLink = wrapper.findAll('.layout-submenu').at(3)?.find('a');
    expect(orgSettingsLink?.attributes('href')).toContain('org-abc');
  });

  it('renders five sections when user belongs to two organizations', async () => {
    orgStore.userOrganizations = [mockOrg, { id: 'org-xyz', name: 'Zweite GmbH' }];
    await wrapper.vm.$nextTick();

    const rootItems = wrapper.findAll('.layout-root-menuitem');
    expect(rootItems).toHaveLength(5);
  });
});
