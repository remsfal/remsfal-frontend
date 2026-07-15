import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, config } from '@vue/test-utils';
import { reactive, nextTick } from 'vue';
import { routeLocationKey } from 'vue-router';
import router from '@/router';
import AppMenuItem, { type MenuItem } from '@/layouts/components/AppMenuItem.vue';
import { useLayout } from '@/layouts/composables/layout';

// Remove global router - we inject a controlled route via routeLocationKey
config.global.plugins = config.global.plugins.filter((p) => p !== router);

describe('AppMenuItem.vue', () => {
  let layout: ReturnType<typeof useLayout>;

  beforeEach(() => {
    layout = useLayout();
    // Reset the shared module-level layout state between tests
    layout.layoutState.activeMenuItem = undefined;
    layout.layoutState.overlayMenuActive = false;
    layout.layoutConfig.menuMode = 'static';
  });

  const defaultRoute = {
    path: '/', name: 'Home', params: {}, query: {} 
  };

  const mountItem = (item: MenuItem, extraProps: object = {}, route = defaultRoute) => {
    const routeRef = reactive(route);
    return mount(AppMenuItem, {
      props: {
        item, root: false, index: 0, ...extraProps 
      },
      global: {
        provide: { [routeLocationKey as symbol]: routeRef },
        stubs: {
          // inheritAttrs: true (default) → onClick and :class automatically forwarded to root <a>
          RouterLink: {
            template: '<a class="router-link-stub"><slot /></a>',
            props: ['to'],
          },
          FontAwesomeIcon: {
            template: '<i class="fa-stub"></i>',
            props: ['icon'],
          },
          // Stub recursive AppMenuItem children
          AppMenuItem: { template: '<li class="stub-child"></li>' },
        },
      },
    });
  };

  describe('root item', () => {
    it('applies layout-root-menuitem class', () => {
      const wrapper = mountItem({ label: 'managerMenu.myData', items: [] }, { root: true });
      expect(wrapper.find('.layout-root-menuitem').exists()).toBe(true);
    });

    it('shows translated root label', () => {
      const wrapper = mountItem({ label: 'managerMenu.myData', items: [] }, { root: true });
      expect(wrapper.find('.layout-menuitem-root-text').text()).toContain('Meine Daten');
    });

    it('hides root text when visible is false', () => {
      const wrapper = mountItem({
        label: 'managerMenu.myData', visible: false, items: [] 
      }, { root: true });
      expect(wrapper.find('.layout-menuitem-root-text').exists()).toBe(false);
    });
  });

  describe('item with children (no route)', () => {
    const parentItem = {
      label: 'managerMenu.myData',
      items: [{ label: 'managerMenu.myData.overview', to: '/manager/dashboard' }],
    };

    it('renders an anchor element', () => {
      const wrapper = mountItem(parentItem);
      expect(wrapper.find('a:not(.router-link-stub)').exists()).toBe(true);
    });

    it('renders the translated label text', () => {
      const wrapper = mountItem(parentItem);
      expect(wrapper.find('.layout-menuitem-text').text()).toContain('Meine Daten');
    });

    it('renders a submenu toggle icon', () => {
      const wrapper = mountItem(parentItem);
      expect(wrapper.find('.layout-submenu-toggler').exists()).toBe(true);
    });

    it('renders a submenu list', () => {
      const wrapper = mountItem(parentItem);
      expect(wrapper.find('.layout-submenu').exists()).toBe(true);
    });

    it('hides anchor when visible is false', () => {
      const wrapper = mountItem({ ...parentItem, visible: false });
      expect(wrapper.find('a').exists()).toBe(false);
    });
  });

  describe('item with route (RouterLink)', () => {
    const leafItem = { label: 'managerMenu.myData.overview', to: '/manager/dashboard' };

    it('renders a RouterLink stub', () => {
      const wrapper = mountItem(leafItem);
      expect(wrapper.find('.router-link-stub').exists()).toBe(true);
    });

    it('renders the translated label text', () => {
      const wrapper = mountItem(leafItem);
      expect(wrapper.find('.layout-menuitem-text').text()).toContain('Meine Übersicht');
    });

    it('hides RouterLink when visible is false', () => {
      const wrapper = mountItem({ ...leafItem, visible: false });
      expect(wrapper.find('.router-link-stub').exists()).toBe(false);
    });

    it('adds active-route class when route path matches item.to', () => {
      const wrapper = mountItem(
        leafItem,
        {},
        {
          path: '/manager/dashboard', name: 'ManagerDashboard', params: {}, query: {} 
        },
      );
      expect(wrapper.find('.active-route').exists()).toBe(true);
    });

    it('does not add active-route class when route path does not match', () => {
      const wrapper = mountItem(
        leafItem,
        {},
        {
          path: '/manager/account-settings', name: 'ManagerAccount', params: {}, query: {} 
        },
      );
      expect(wrapper.find('.active-route').exists()).toBe(false);
    });

    it('does not add active-route class for "/" items', () => {
      const rootItem = { label: 'projectMenu.home.label', to: '/' };
      const wrapper = mountItem(rootItem, {}, {
        path: '/', name: 'Home', params: {}, query: {}
      });
      expect(wrapper.find('.active-route').exists()).toBe(false);
    });
  });

  describe('query-aware active state (object to)', () => {
    const projectId = '123';
    const openItem: MenuItem = {
      label: 'projectMenu.issueManagement.open',
      to: {
        name: 'IssueOverview', params: { projectId }, query: { status: 'OPEN', type: 'TASK' } 
      },
    };
    const allItem: MenuItem = {
      label: 'projectMenu.issueManagement.all',
      to: {
        name: 'IssueOverview', params: { projectId }, query: { type: 'TASK' } 
      },
    };

    it('highlights the item whose query exactly matches the route', () => {
      const wrapper = mountItem(openItem, {}, {
        path: '/projects/123/issues', name: 'IssueOverview', params: { projectId }, query: { status: 'OPEN', type: 'TASK' },
      });
      expect(wrapper.find('.active-route').exists()).toBe(true);
    });

    it('does not highlight a sibling item whose query is a subset of the route query', () => {
      // Regression test for the bug where "Alle Aufgaben" (no status) also lit up
      // while viewing "Offene Aufgaben" (?status=OPEN&type=TASK), since both share
      // the IssueOverview route and "all" only declares type=TASK.
      const wrapper = mountItem(allItem, {}, {
        path: '/projects/123/issues', name: 'IssueOverview', params: { projectId }, query: { status: 'OPEN', type: 'TASK' },
      });
      expect(wrapper.find('.active-route').exists()).toBe(false);
    });

    it('highlights the "all" item only when the route has no extra query params', () => {
      const wrapper = mountItem(allItem, {}, {
        path: '/projects/123/issues', name: 'IssueOverview', params: { projectId }, query: { type: 'TASK' },
      });
      expect(wrapper.find('.active-route').exists()).toBe(true);
    });

    it('does not highlight when the route name differs even if the query matches', () => {
      const wrapper = mountItem(allItem, {}, {
        path: '/projects/123/issues/abc',
        name: 'IssueDetails',
        params: { projectId, issueId: 'abc' },
        query: { type: 'TASK' },
      });
      expect(wrapper.find('.active-route').exists()).toBe(false);
    });
  });

  describe('icons', () => {
    it('renders a PrimeIcon <i> element for pi icon type', () => {
      const item: MenuItem = {
        label: 'managerMenu.myData.overview',
        to: '/manager/dashboard',
        icon: { type: 'pi', name: 'pi pi-fw pi-chart-bar' },
      };
      const wrapper = mountItem(item);
      const icon = wrapper.find('i.layout-menuitem-icon');
      expect(icon.exists()).toBe(true);
      expect(icon.classes()).toContain('pi-chart-bar');
    });

    it('renders FontAwesomeIcon for fa icon type', () => {
      const item: MenuItem = {
        label: 'projectMenu.issueManagement.mine',
        to: '/projects/1/issues',
        icon: { type: 'fa', name: ['fas', 'list'] },
      };
      const wrapper = mountItem(item);
      expect(wrapper.find('.fa-stub').exists()).toBe(true);
    });

    it('does not render icon when icon is null', () => {
      const item = {
        label: 'managerMenu.myData.overview', to: '/manager/dashboard', icon: null 
      };
      const wrapper = mountItem(item);
      expect(wrapper.find('.layout-menuitem-icon').exists()).toBe(false);
      expect(wrapper.find('.fa-stub').exists()).toBe(false);
    });
  });

  describe('click handling', () => {
    it('calls command callback on click', async () => {
      const command = vi.fn();
      const item = {
        label: 'managerMenu.myData.overview', to: '/manager/dashboard', command 
      };
      const wrapper = mountItem(item);
      await wrapper.find('.router-link-stub').trigger('click');
      expect(command).toHaveBeenCalled();
    });

    it('calls navigate callback on click', async () => {
      const navigate = vi.fn();
      const item = {
        label: 'managerMenu.myData.overview', to: '/manager/dashboard', navigate 
      };
      const wrapper = mountItem(item);
      await wrapper.find('.router-link-stub').trigger('click');
      expect(navigate).toHaveBeenCalled();
    });

    it('updates layoutState.activeMenuItem when item is clicked', async () => {
      const item = { label: 'managerMenu.myData.overview', to: '/manager/dashboard' };
      const wrapper = mountItem(item, { index: 0 });
      await wrapper.find('.router-link-stub').trigger('click');
      expect(layout.layoutState.activeMenuItem).toBe('0');
    });

    it('does not call command when item is disabled', async () => {
      const command = vi.fn();
      const item = {
        label: 'managerMenu.myData.overview', to: '/manager/dashboard', command, disabled: true 
      };
      const wrapper = mountItem(item);
      await wrapper.find('.router-link-stub').trigger('click');
      expect(command).not.toHaveBeenCalled();
    });

    it('does not call navigate when item is disabled', async () => {
      const navigate = vi.fn();
      const item = {
        label: 'managerMenu.myData.overview', to: '/manager/dashboard', navigate, disabled: true 
      };
      const wrapper = mountItem(item);
      await wrapper.find('.router-link-stub').trigger('click');
      expect(navigate).not.toHaveBeenCalled();
    });

  });

  describe('active menu state', () => {
    it('applies active-menuitem class when layoutState.activeMenuItem matches itemKey', async () => {
      layout.layoutState.activeMenuItem = '0';
      const item = { label: 'managerMenu.myData.overview', to: '/manager/dashboard' };
      const wrapper = mountItem(item, { index: 0 });
      await nextTick();
      expect(wrapper.find('li').classes()).toContain('active-menuitem');
    });

    it('applies active-menuitem class when activeMenuItem starts with itemKey', async () => {
      // index=0 → itemKey='0'; '0-1'.startsWith('0-') = true
      layout.layoutState.activeMenuItem = '0-1';
      const item = { label: 'managerMenu.myData.overview', to: '/manager/dashboard' };
      const wrapper = mountItem(item, { index: 0 });
      await nextTick();
      expect(wrapper.find('li').classes()).toContain('active-menuitem');
    });

    it('does not apply active-menuitem class when key does not match', async () => {
      // Keep activeMenuItem undefined (reset in beforeEach)
      const item = { label: 'managerMenu.myData.overview', to: '/manager/dashboard' };
      const wrapper = mountItem(item, { index: 0 });
      await nextTick();
      expect(wrapper.find('li').classes()).not.toContain('active-menuitem');
    });

    it('updates active state reactively when layoutState.activeMenuItem changes', async () => {
      const item = { label: 'managerMenu.myData.overview', to: '/manager/dashboard' };
      const wrapper = mountItem(item, { index: 0 });
      await nextTick();
      expect(wrapper.find('li').classes()).not.toContain('active-menuitem');

      layout.layoutState.activeMenuItem = '0';
      await nextTick();
      expect(wrapper.find('li').classes()).toContain('active-menuitem');
    });
  });
});
