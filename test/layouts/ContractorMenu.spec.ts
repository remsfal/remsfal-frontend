import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import ContractorMenu from '@/layouts/components/ContractorMenu.vue';
import { useUserSessionStore } from '@/stores/UserSession';
import { useOrganizationStore } from '@/stores/OrganizationStore';

describe('ContractorMenu.vue', () => {
  let wrapper: VueWrapper;
  let userSessionStore: ReturnType<typeof useUserSessionStore>;

  beforeEach(() => {
    userSessionStore = useUserSessionStore();
    const orgStore = useOrganizationStore();
    orgStore.$reset();
    vi.spyOn(orgStore, 'fetchUserOrganization').mockResolvedValue();
    wrapper = mount(ContractorMenu);
  });

  afterEach(() => {
    wrapper.unmount();
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
      'Meine Auftraggeber',
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
    userSessionStore.user = { id: 'user-1', email: 'test@example.com' };
    const pushSpy = vi.spyOn(wrapper.vm.$router, 'push');

    await wrapper.find('.pi-home').trigger('click');
    expect(pushSpy).toHaveBeenCalledWith('/contractor/dashboard');
  });

  it('navigates to the client list when the clients menu item is clicked', async () => {
    userSessionStore.user = { id: 'user-1', email: 'test@example.com' };
    const pushSpy = vi.spyOn(wrapper.vm.$router, 'push');

    const clientsItem = wrapper.findAll('.layout-menuitem-text').find((item) => item.text() === 'Meine Auftraggeber');
    await clientsItem!.trigger('click');
    expect(pushSpy).toHaveBeenCalledWith('/contractor/clients');
  });

  it('calls fetchUserOrganization on mount when store is not initialized', async () => {
    const orgStore = useOrganizationStore();
    orgStore.initialized = false;
    const fetchSpy = vi.spyOn(orgStore, 'fetchUserOrganization').mockResolvedValue();
    // createTestingPinia already wraps actions in a spy, so the call from the
    // beforeEach mount may be recorded on it as well
    fetchSpy.mockClear();

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

  it('does not fetch organizations again when the store is initialized', () => {
    const orgStore = useOrganizationStore();
    orgStore.initialized = true;
    vi.mocked(orgStore.fetchUserOrganization).mockClear();
    wrapper.unmount();
    wrapper = mount(ContractorMenu);

    expect(orgStore.fetchUserOrganization).not.toHaveBeenCalled();
  });

  it.each(['click', 'keydown.enter', 'keydown.space'])(
    'keeps all order entries inactive on %s without membership', async (event) => {
      const orgStore = useOrganizationStore();
      orgStore.initialized = true;
      await wrapper.vm.$nextTick();
      const pushSpy = vi.spyOn(wrapper.vm.$router, 'push');

      for (const label of ['Offene Anfragen', 'Laufende Aufträge', 'Abgeschlossene Aufträge']) {
        const entry = wrapper.findAll('.layout-submenu a').find(item => item.text() === label)!;
        expect(entry.attributes('href')).toBeUndefined();
        expect(entry.attributes('aria-disabled')).toBe('true');
        expect(entry.classes()).toContain('text-muted-color');
        expect(entry.classes()).toContain('cursor-not-allowed');
        await entry.trigger(event);
      }

      expect(pushSpy).not.toHaveBeenCalled();
      expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
    },
  );

  it('keeps order links enabled while organizations are still loading', async () => {
    const orgStore = useOrganizationStore();
    expect(orgStore.initialized).toBe(false);

    for (const status of ['open', 'ongoing', 'closed']) {
      expect(wrapper.find(`a[href="/contractor/orders/${status}"]`).exists()).toBe(true);
      expect(wrapper.get(`a[href="/contractor/orders/${status}"]`).attributes('aria-disabled')).toBeUndefined();
    }

    orgStore.initialized = true;
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll('a[aria-disabled="true"]')).toHaveLength(3);
    for (const status of ['open', 'ongoing', 'closed']) {
      expect(wrapper.find(`a[href="/contractor/orders/${status}"]`).exists()).toBe(false);
    }
  });

  it.each(['owner', 'employee'])(
    'enables all order links reactively when the user becomes an %s', async (role) => {
      const orgStore = useOrganizationStore();
      orgStore.initialized = true;
      if (role === 'owner') {
        orgStore.userOrganizations = [{ id: 'org-1', name: 'Test GmbH' }];
      } else {
        orgStore.userEmployments = [{ employeeRole: 'STAFF' }];
      }
      await wrapper.vm.$nextTick();

      for (const status of ['open', 'ongoing', 'closed']) {
        const entry = wrapper.get(`a[href="/contractor/orders/${status}"]`);
        expect(entry.attributes('aria-disabled')).toBeUndefined();
        expect(entry.classes()).not.toContain('cursor-not-allowed');
      }

      orgStore.userOrganizations = [];
      orgStore.userEmployments = [];
      await wrapper.vm.$nextTick();

      for (const status of ['open', 'ongoing', 'closed']) {
        expect(wrapper.find(`a[href="/contractor/orders/${status}"]`).exists()).toBe(false);
      }
    },
  );

  it('renders named organizations and a fallback label while ignoring organizations without an id', async () => {
    useOrganizationStore().userOrganizations = [
      { id: 'org-1', name: 'Test GmbH' },
      { id: 'org-2' },
      { name: 'Missing ID' },
    ];
    await wrapper.vm.$nextTick();

    const roots = wrapper.findAll('.layout-root-menuitem');
    expect(roots).toHaveLength(5);
    expect(roots[3].get('.layout-menuitem-root-text').text()).toBe('Test GmbH');
    expect(roots[4].get('.layout-menuitem-root-text').text()).toBe('Organisation');
    expect(wrapper.text()).not.toContain('Missing ID');
    expect(roots[3].get('.layout-submenu a').attributes('href')).toBe('/contractor/organizations/org-1');
    expect(roots[4].get('.layout-submenu a').attributes('href')).toBe('/contractor/organizations/org-2');
  });
});
