import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock capacitor core/utils
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => false } }));
vi.mock('@/helper/platform', () => ({ isNativePlatform: () => false }));

// Mock the Menu component to prevent it from importing dependencies that fail resolution
vi.mock('@/layouts/components/ContractorMenu.vue', () => ({ default: { name: 'ContractorMenu', template: '<div></div>' } }));

import { mount, config } from '@vue/test-utils';
import ContractorMobileBar from '@/layouts/components/ContractorMobileBar.vue';
import { reactive } from 'vue';
import { routeLocationKey } from 'vue-router';
import router from '@/router';
import { useOrganizationStore } from '@/features/common/organizations/stores/OrganizationStore';

// Remove global router plugin for this test file
// We need manual control over routing
config.global.plugins = config.global.plugins.filter(p => p !== router);

// Stub for RouterLink
const RouterLinkStub = {
  template: '<a><slot /></a>',
  props: ['to']
};

describe('ContractorMobileBar.vue', () => {
  let orgStore: ReturnType<typeof useOrganizationStore>;

  beforeEach(() => {
    orgStore = useOrganizationStore();
    orgStore.$reset();
    vi.spyOn(orgStore, 'fetchUserOrganization').mockResolvedValue();
  });

  const defaultRoute = { path: '/contractor/dashboard', name: 'ContractorDashboard' };
  const mountComponent = (initialRoute = defaultRoute) => {
    const route = reactive(initialRoute);

    const wrapper = mount(ContractorMobileBar, {
      global: {
        provide: { [routeLocationKey as symbol]: route },
        stubs: {
          ContractorMenu: true,
          Drawer: {
            template: '<div class="p-drawer" v-if="visible"><slot /></div>',
            props: ['visible']
          },
          RouterLink: RouterLinkStub
        }
      }
    });

    return { wrapper, route };
  };

  it('renders navigation items correctly', () => {
    const { wrapper } = mountComponent();
    const navItems = wrapper.findAll('a.nav-item');
    expect(navItems).toHaveLength(3);
  });

  it('renders translated screen reader labels', () => {
    const { wrapper } = mountComponent();
    const labels = wrapper.findAll('.sr-only').map((label) => label.text());
    expect(labels).toEqual(['Übersicht', 'Offene Anfragen', 'Laufende Aufträge']);
  });

  it('highlights Übersicht when on ContractorDashboard route', async () => {
    const { wrapper } = mountComponent({ path: '/contractor/dashboard', name: 'ContractorDashboard' });
    await wrapper.vm.$nextTick();

    const navItems = wrapper.findAll('a.nav-item');
    expect(navItems[0].classes()).toContain('active');
    expect(navItems[1].classes()).not.toContain('active');
    expect(navItems[2].classes()).not.toContain('active');
  });

  it('highlights Offene Anfragen when on ContractorOrdersOpen route', async () => {
    const { wrapper } = mountComponent({ path: '/contractor/orders/open', name: 'ContractorOrdersOpen' });
    await wrapper.vm.$nextTick();

    const navItems = wrapper.findAll('a.nav-item');
    expect(navItems[0].classes()).not.toContain('active');
    expect(navItems[1].classes()).toContain('active');
    expect(navItems[2].classes()).not.toContain('active');
  });

  it('highlights Laufende Aufträge when on ContractorOrdersOngoing route', async () => {
    const { wrapper } = mountComponent({ path: '/contractor/orders/ongoing', name: 'ContractorOrdersOngoing' });
    await wrapper.vm.$nextTick();

    const navItems = wrapper.findAll('a.nav-item');
    expect(navItems[0].classes()).not.toContain('active');
    expect(navItems[1].classes()).not.toContain('active');
    expect(navItems[2].classes()).toContain('active');
  });

  it('does not highlight any item when on an unrelated route', async () => {
    const { wrapper } = mountComponent({ path: '/other', name: 'AnotherView' });
    await wrapper.vm.$nextTick();

    const navItems = wrapper.findAll('a.nav-item');
    expect(navItems[0].classes()).not.toContain('active');
    expect(navItems[1].classes()).not.toContain('active');
    expect(navItems[2].classes()).not.toContain('active');
  });

  it('loads the organizations on mount when the store is not initialized', () => {
    mountComponent();
    expect(orgStore.fetchUserOrganization).toHaveBeenCalledTimes(1);
  });

  it('does not reload the organizations when the store is already initialized', () => {
    orgStore.initialized = true;
    mountComponent();
    expect(orgStore.fetchUserOrganization).not.toHaveBeenCalled();
  });

  it('keeps order items enabled while the organizations are loading', () => {
    const { wrapper } = mountComponent();
    const navItems = wrapper.findAll('a.nav-item');
    expect(navItems[1].classes()).not.toContain('disabled');
    expect(navItems[2].classes()).not.toContain('disabled');
  });

  it('disables order items for users without an organization', () => {
    orgStore.initialized = true;
    const { wrapper } = mountComponent();
    const navItems = wrapper.findAll('a.nav-item');
    expect(navItems[0].classes()).not.toContain('disabled');
    expect(navItems[1].classes()).toContain('disabled');
    expect(navItems[1].attributes('aria-disabled')).toBe('true');
    expect(navItems[2].classes()).toContain('disabled');
  });

  it('enables order items for organization members', () => {
    orgStore.initialized = true;
    orgStore.userEmployments = [{ organizationId: 'org-1', employeeRole: 'STAFF' }];
    const { wrapper } = mountComponent();
    const navItems = wrapper.findAll('a.nav-item');
    expect(navItems[1].classes()).not.toContain('disabled');
    expect(navItems[2].classes()).not.toContain('disabled');
  });

  it('toggles sidebar when more button is clicked', async () => {
    const { wrapper } = mountComponent();
    const moreBtn = wrapper.find('.more-btn');

    expect(wrapper.find('.p-drawer').exists()).toBe(false);
    await moreBtn.trigger('click');
    expect(wrapper.find('.p-drawer').exists()).toBe(true);

    await moreBtn.trigger('click');
    expect(wrapper.find('.p-drawer').exists()).toBe(false);
  });
});
