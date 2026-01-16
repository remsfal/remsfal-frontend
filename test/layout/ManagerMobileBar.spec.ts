import { describe, it, expect, vi } from 'vitest';

// Mock capacitor core/utils
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => false } }));
vi.mock('@/helper/platform', () => ({ isNativePlatform: () => false }));

// Mock the Menu component to prevent it from importing dependencies that fail resolution
vi.mock('@/layout/ManagerMenu.vue', () => ({ default: { name: 'ManagerMenu', template: '<div></div>' } }));

import { mount, config } from '@vue/test-utils';
import ManagerMobileBar from '@/layout/ManagerMobileBar.vue';
import PrimeVue from 'primevue/config';
import { reactive } from 'vue';
import { routeLocationKey } from 'vue-router';
import router from '@/router';

// Remove global router plugin - skipping this as strict equality with mock won't match real router anyway.
// Ideally we rely on mount options.




// Remove global router plugin for this test file
config.global.plugins = config.global.plugins.filter(p => p !== router);

// Mock FontAwesomeIcon
const FontAwesomeIcon = {
    template: '<i class="fa-icon"></i>',
    props: ['icon']
};

const RouterLinkStub = {
    template: '<a><slot /></a>',
    props: ['to']
};

describe('ManagerMobileBar.vue', () => {
    const defaultRoute = {
        path: '/', name: 'ProjectSelection', params: {}, query: {}
    };
    const mountComponent = (initialRoute = defaultRoute) => {
        const route = reactive(initialRoute);

        // Create base wrapper
        const wrapper = mount(ManagerMobileBar, {
            global: {
                plugins: [PrimeVue],
                provide: { [routeLocationKey as symbol]: route },
                components: { FontAwesomeIcon },
                stubs: {
                    ManagerMenu: true,
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

    it('renders global navigation items when no project is selected', async () => {
        const { wrapper } = mountComponent({
            path: '/', name: 'ProjectSelection', params: {}, query: {}
        });

        const navItems = wrapper.findAll('a.nav-item');
        expect(navItems.length).toBe(2);
        expect(navItems[0].text()).toContain('Projekte');
    });

    it('renders project navigation items when project is selected', async () => {
        const { wrapper } = mountComponent({
            path: '/projects/123/dashboard',
            name: 'ProjectDashboard',
            params: { projectId: '123' },
            query: {}
        });

        const navItems = wrapper.findAll('a.nav-item');
        expect(navItems.length).toBe(4);
        expect(navItems[0].text()).toContain('Dashboard');
    });

    it('highlights Tasks vs Defects based on query params', async () => {
        const { wrapper, route } = mountComponent({
            path: '/projects/123/issues',
            name: 'IssueOverview',
            params: { projectId: '123' },
            query: { status: 'OPEN', category: 'TASK' }
        });
        await wrapper.vm.$nextTick();

        const navItems = wrapper.findAll('a.nav-item');
        expect(navItems[1].classes()).toContain('active');
        expect(navItems[2].classes()).not.toContain('active');

        // Switch to Defects
        Object.assign(route, { query: { status: 'OPEN', category: 'DEFECT' } });
        // Force update if needed, but reactivity should handle it. 
        // Note: ManagerMobileBar computes navItems based on route.params.projectId 
        // AND isActive checks route.query. 
        // We need to trigger a re-render or at least re-evaluation or just wait for next tick.
        await wrapper.vm.$nextTick();

        expect(navItems[1].classes()).not.toContain('active');
        expect(navItems[2].classes()).toContain('active');
    });

    it('highlights Dashboard correctly', async () => {
        const { wrapper } = mountComponent({
            path: '/projects/123/dashboard',
            name: 'ProjectDashboard',
            params: { projectId: '123' },
            query: {}
        });
        await wrapper.vm.$nextTick();

        const navItems = wrapper.findAll('a.nav-item');
        expect(navItems[0].classes()).toContain('active');
    });

    it('highlights Chat correctly', async () => {
        const { wrapper } = mountComponent({
            path: '/projects/123/chat',
            name: 'ProjectChatView',
            params: { projectId: '123' },
            query: {}
        });
        await wrapper.vm.$nextTick();

        const navItems = wrapper.findAll('a.nav-item');
        expect(navItems[3].classes()).toContain('active');
    });

    it('does not highlight items when route matches name but query mismatch in strict mode', async () => {
        // IssueOverview defaults need strict checking if configured that way.
        // In the component:
        // const strict = !Object.keys(targetQuery).length && route.name === ((target as any).name);
        // For Tasks item: targetQuery is {status: 'OPEN', category: 'TASK'}. not strict.
        // It checks matchesQuery.

        // Let's try to match Task item but with wrong query
        const { wrapper } = mountComponent({
            path: '/projects/123/issues',
            name: 'IssueOverview',
            params: { projectId: '123' },
            query: { status: 'OPEN', category: 'SOMETHING_ELSE' }
        });
        await wrapper.vm.$nextTick();

        const navItems = wrapper.findAll('a.nav-item');
        // Debug checks
        // console.log('Route Params:', route.params); 
        // console.log('Items:', navItems.length);

        // Ensure projectId is picked up
        // expect(route.params.projectId).toBe('123');

        // Task Item (index 1) checks for category=TASK. Should fail.
        // Defect Item (index 2) checks for category=DEFECT. Should fail.
        expect(navItems[1].classes()).not.toContain('active');
        expect(navItems[2].classes()).not.toContain('active');
    });

    it('does not highlight items when route matches name but query mismatch in strict mode', async () => {
        // IssueOverview defaults need strict checking if configured that way.
        // In the component:
        // const strict = !Object.keys(targetQuery).length && route.name === ((target as any).name);
        // For Tasks item: targetQuery is {status: 'OPEN', category: 'TASK'}. not strict.
        // It checks matchesQuery.

        // Let's try to match Task item but with wrong query
        const { wrapper } = mountComponent({
            path: '/projects/123/issues',
            name: 'IssueOverview',
            params: { projectId: '123' },
            query: { status: 'OPEN', category: 'SOMETHING_ELSE' }
        });
        await wrapper.vm.$nextTick();

        const navItems = wrapper.findAll('a.nav-item');
        // Task Item (index 1) checks for category=TASK. Should fail.
        // Defect Item (index 2) checks for category=DEFECT. Should fail.
        expect(navItems[1].classes()).not.toContain('active');
        expect(navItems[2].classes()).not.toContain('active');
    });

    it('does not highlight items that require NO query (strict) when route HAS query', async () => {
        // Dashboard item (index 0) has NO query. Strict mode is TRUE.
        // If we are on Dashboard route BUT with a query param, it should NOT be active.
        const { wrapper } = mountComponent({
            path: '/projects/123/dashboard',
            name: 'ProjectDashboard',
            params: { projectId: '123' },
            query: { someFilter: 'true' }
        });
        await wrapper.vm.$nextTick();

        const navItems = wrapper.findAll('a.nav-item');
        expect(navItems[0].classes()).not.toContain('active');
    });

    it('does not highlight items when route name differs completely', async () => {
        const { wrapper } = mountComponent({
            path: '/projects/123/settings', // Assuming some other route sharing layout
            name: 'SomeOtherRoute',
            params: { projectId: '123' },
            query: {}
        });
        await wrapper.vm.$nextTick();

        const navItems = wrapper.findAll('a.nav-item');
        expect(navItems[0].classes()).not.toContain('active');
        expect(navItems[1].classes()).not.toContain('active');
        expect(navItems[2].classes()).not.toContain('active');
        expect(navItems[3].classes()).not.toContain('active');
    });

    it('toggles sidebar', async () => {
        const { wrapper } = mountComponent();
        const moreBtn = wrapper.find('.more-btn');

        expect(wrapper.vm.sidebarVisible).toBe(false);
        await moreBtn.trigger('click');
        expect(wrapper.vm.sidebarVisible).toBe(true);
    });
});
