import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ManagerMobileBar from '@/layout/ManagerMobileBar.vue';
import PrimeVue from 'primevue/config';
import { reactive } from 'vue';
import { routeLocationKey } from 'vue-router';
import { config } from '@vue/test-utils';
import router from '@/router';

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
    const mountComponent = (initialRoute = {
        path: '/', name: 'ProjectSelection', params: {}, query: {}
    }) => {
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
        // Need to trigger reactivity. 
        // ManagerMobileBar uses computed for navItems which depends on route props.
        // route is reactive.
        Object.assign(route, { query: { status: 'OPEN', category: 'DEFECT' } });
        await wrapper.vm.$nextTick();

        expect(navItems[1].classes()).not.toContain('active');
        expect(navItems[2].classes()).toContain('active');
    });

    it('toggles sidebar', async () => {
        const { wrapper } = mountComponent();
        const moreBtn = wrapper.find('.more-btn');

        expect(wrapper.vm.sidebarVisible).toBe(false);
        await moreBtn.trigger('click');
        expect(wrapper.vm.sidebarVisible).toBe(true);
    });
});
