import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import ContractorMenu from '@/layouts/components/ContractorMenu.vue';
import { useUserSessionStore } from '@/stores/UserSession';
import { useOrganizationStore } from '@/stores/OrganizationStore';

describe('ContractorMenu.vue', () => {
  let wrapper: VueWrapper;
  let userSessionStore;

  beforeEach(() => {
    userSessionStore = useUserSessionStore();
    wrapper = mount(ContractorMenu);
  });

  it('should render the correct menu structure', async () => {
    await wrapper.vm.$nextTick();

    const rootMenuItems = wrapper.findAll('.layout-root-menuitem');
    expect(rootMenuItems).toHaveLength(3);
    expect(rootMenuItems[0].text()).toContain('Auftragsmanagement');
    expect(rootMenuItems[1].text()).toContain('Meine Daten');
    expect(rootMenuItems[2].text()).toContain('Organisationen');

    const submenus = wrapper.findAll('.layout-submenu');
    expect(submenus).toHaveLength(3);
  });


  it('should render the correct menu labels', async () => {
    await wrapper.vm.$nextTick();
    const submenuLabels = wrapper.findAll('.layout-submenu .layout-menuitem-text');

    const expectedSubmenuLabels = [
      'Übersicht',
      'Offene Anfragen',
      'Laufende Aufträge',
      'Abgeschlossene Aufträge',
      'Persönliche Daten',
      'Persönliche Einstellungen',
      'Organisationen anlegen',
    ];

    expectedSubmenuLabels.forEach((label, index) => {
      expect(submenuLabels[index].text()).toContain(label);
    });
  });

  it('should render the correct icons for menu items', async () => {
    await wrapper.vm.$nextTick();

    const overviewIcon = wrapper.find('.pi-home');
    expect(overviewIcon.exists()).toBe(true);

    const clientIcon = wrapper.find('.pi-id-card');
    expect(clientIcon.exists()).toBe(true);
  });

  it('should navigate correctly when menu items are clicked', async () => {
    userSessionStore.user = { email: 'test@example.com' };
    const pushSpy = vi.spyOn(wrapper.vm.$router, 'push');

    await wrapper.find('.pi-home').trigger('click');
    expect(pushSpy).toHaveBeenCalledWith('/contractor/dashboard');
  });

  it('calls fetchUserOrganization on mount when store is not initialized', async () => {
    const orgStore = useOrganizationStore();
    orgStore.initialized = false;
    const fetchSpy = vi.spyOn(orgStore, 'fetchUserOrganization').mockResolvedValue();

    mount(ContractorMenu);

    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  it('renders organization menu item when userOrganizations is populated', async () => {
    const orgStore = useOrganizationStore();
    orgStore.userOrganizations = [{ id: 'org-1', name: 'Test GmbH' }];

    const localWrapper = mount(ContractorMenu);
    await flushPromises();

    expect(localWrapper.text()).toContain('Test GmbH');
  });

  it('renders organization settings link for each organization', async () => {
    const orgStore = useOrganizationStore();
    orgStore.userOrganizations = [{ id: 'org-1', name: 'Test GmbH' }];

    const localWrapper = mount(ContractorMenu);
    await flushPromises();

    const links = localWrapper.findAll('a');
    const orgSettingsLink = links.find(l => l.attributes('href')?.includes('/contractor/organizations/org-1'));
    expect(orgSettingsLink).toBeDefined();
  });

});
