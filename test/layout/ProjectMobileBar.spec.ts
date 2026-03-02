import { describe, it, expect, vi } from 'vitest';

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => false } }));
vi.mock('@/helper/platform', () => ({ isNativePlatform: () => false }));

// Mock ProjectMenu to avoid deep dependency resolution
vi.mock('@/layout/ProjectMenu.vue', () => ({ default: { name: 'ProjectMenu', template: '<div></div>' } }));
// Mock ProjectStore used by ProjectMenu
vi.mock('@/stores/ProjectStore', () => ({
useProjectStore: () => ({
 projectId: undefined, projectList: [], selectedProject: null 
}),
}));

import { mount, config } from '@vue/test-utils';
import ProjectMobileBar from '@/layout/ProjectMobileBar.vue';
import PrimeVue from 'primevue/config';
import { reactive } from 'vue';
import { routeLocationKey } from 'vue-router';
import router from '@/router';

config.global.plugins = config.global.plugins.filter(p => p !== router);

const FontAwesomeIcon = {
  template: '<i class="fa-icon"></i>',
  props: ['icon'],
};

const RouterLinkStub = {
  template: '<a><slot /></a>',
  props: ['to'],
};

describe('ProjectMobileBar.vue', () => {
  const defaultRoute = {
 path: '/', name: 'ProjectSelection', params: {}, query: {} 
};

  const mountComponent = (initialRoute = defaultRoute) => {
    const route = reactive(initialRoute);
    const wrapper = mount(ProjectMobileBar, {
      global: {
        plugins: [PrimeVue],
        provide: { [routeLocationKey as symbol]: route },
        components: { FontAwesomeIcon },
        stubs: {
          ProjectMenu: true,
          Drawer: {
            template: '<div class="p-drawer" v-if="visible"><slot /></div>',
            props: ['visible'],
          },
          RouterLink: RouterLinkStub,
        },
      },
    });
    return { wrapper, route };
  };

  it('renders global navigation items when no project is selected', () => {
    const { wrapper } = mountComponent({
 path: '/', name: 'ProjectSelection', params: {}, query: {} 
});
    const navItems = wrapper.findAll('a.nav-item');
    expect(navItems.length).toBe(2);
  });

  it('renders project navigation items when project is selected', () => {
    const { wrapper } = mountComponent({
      path: '/projects/123/dashboard',
      name: 'ProjectDashboard',
      params: { projectId: '123' },
      query: {},
    });
    const navItems = wrapper.findAll('a.nav-item');
    expect(navItems.length).toBe(4);
  });

  it('highlights Dashboard when on project dashboard route', async () => {
    const { wrapper } = mountComponent({
      path: '/projects/123/dashboard',
      name: 'ProjectDashboard',
      params: { projectId: '123' },
      query: {},
    });
    await wrapper.vm.$nextTick();
    const navItems = wrapper.findAll('a.nav-item');
    expect(navItems[0].classes()).toContain('active');
  });

  it('highlights Tasks when on IssueOverview with TASK category', async () => {
    const { wrapper } = mountComponent({
      path: '/projects/123/issues',
      name: 'IssueOverview',
      params: { projectId: '123' },
      query: { status: 'OPEN', category: 'TASK' },
    });
    await wrapper.vm.$nextTick();
    const navItems = wrapper.findAll('a.nav-item');
    expect(navItems[1].classes()).toContain('active');
    expect(navItems[2].classes()).not.toContain('active');
  });

  it('highlights Defects when on IssueOverview with DEFECT category', async () => {
    const { wrapper } = mountComponent({
      path: '/projects/123/issues',
      name: 'IssueOverview',
      params: { projectId: '123' },
      query: { status: 'OPEN', category: 'DEFECT' },
    });
    await wrapper.vm.$nextTick();
    const navItems = wrapper.findAll('a.nav-item');
    expect(navItems[1].classes()).not.toContain('active');
    expect(navItems[2].classes()).toContain('active');
  });

  it('highlights Chat when on ProjectChatView', async () => {
    const { wrapper } = mountComponent({
      path: '/projects/123/chat',
      name: 'ProjectChatView',
      params: { projectId: '123' },
      query: {},
    });
    await wrapper.vm.$nextTick();
    const navItems = wrapper.findAll('a.nav-item');
    expect(navItems[3].classes()).toContain('active');
  });

  it('does not highlight any item when query does not match', async () => {
    const { wrapper } = mountComponent({
      path: '/projects/123/issues',
      name: 'IssueOverview',
      params: { projectId: '123' },
      query: { status: 'OPEN', category: 'SOMETHING_ELSE' },
    });
    await wrapper.vm.$nextTick();
    const navItems = wrapper.findAll('a.nav-item');
    expect(navItems[1].classes()).not.toContain('active');
    expect(navItems[2].classes()).not.toContain('active');
  });

  it('does not highlight Dashboard when route has extra query params', async () => {
    const { wrapper } = mountComponent({
      path: '/projects/123/dashboard',
      name: 'ProjectDashboard',
      params: { projectId: '123' },
      query: { someFilter: 'true' },
    });
    await wrapper.vm.$nextTick();
    const navItems = wrapper.findAll('a.nav-item');
    expect(navItems[0].classes()).not.toContain('active');
  });

  it('does not highlight items when route name does not match', async () => {
    const { wrapper } = mountComponent({
      path: '/projects/123/settings',
      name: 'ProjectSettings',
      params: { projectId: '123' },
      query: {},
    });
    await wrapper.vm.$nextTick();
    const navItems = wrapper.findAll('a.nav-item');
    navItems.forEach(item => expect(item.classes()).not.toContain('active'));
  });

  it('toggles sidebar on more button click', async () => {
    const { wrapper } = mountComponent();
    const moreBtn = wrapper.find('.more-btn');
    expect(wrapper.vm.sidebarVisible).toBe(false);
    await moreBtn.trigger('click');
    expect(wrapper.vm.sidebarVisible).toBe(true);
  });

  it('renders ProjectMenu inside drawer', async () => {
    const { wrapper } = mountComponent();
    const moreBtn = wrapper.find('.more-btn');
    await moreBtn.trigger('click');
    const drawer = wrapper.find('.p-drawer');
    expect(drawer.exists()).toBe(true);
  });
});
