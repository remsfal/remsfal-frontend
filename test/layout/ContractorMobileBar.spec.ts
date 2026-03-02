import { describe, it, expect, vi } from 'vitest';

// Mock capacitor core/utils
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => false } }));
vi.mock('@/helper/platform', () => ({ isNativePlatform: () => false }));

// Mock the Menu component to prevent it from importing dependencies that fail resolution
vi.mock('@/layout/ContractorMenu.vue', () => ({ default: { name: 'ContractorMenu', template: '<div></div>' } }));

import { mount, config } from '@vue/test-utils';
import ContractorMobileBar from '@/layout/ContractorMobileBar.vue';
import PrimeVue from 'primevue/config';
import { reactive } from 'vue';
import { routeLocationKey } from 'vue-router';
import router from '@/router';

// Remove global router plugin for this test file
// We need manual control over routing
config.global.plugins = config.global.plugins.filter(p => p !== router);

// Stub for RouterLink
const RouterLinkStub = {
    template: '<a><slot /></a>',
    props: ['to']
};

describe('ContractorMobileBar.vue', () => {
    const defaultRoute = { path: '/contractor/dashboard', name: 'ContractorDashboard' };
    const mountComponent = (initialRoute = defaultRoute) => {
        const route = reactive(initialRoute);

        const wrapper = mount(ContractorMobileBar, {
            global: {
                plugins: [PrimeVue],
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
        expect(navItems.length).toBe(2);
    });

    it('highlights Übersicht when on ContractorDashboard route', async () => {
        const { wrapper } = mountComponent({ path: '/contractor/dashboard', name: 'ContractorDashboard' });
        await wrapper.vm.$nextTick();

        const navItems = wrapper.findAll('a.nav-item');
        expect(navItems[0].classes()).toContain('active');
        expect(navItems[1].classes()).not.toContain('active');
    });

    it('highlights Auftraggeber when on ContractorView route', async () => {
        const { wrapper } = mountComponent({ path: '/contractor/issues', name: 'ContractorView' });
        await wrapper.vm.$nextTick();

        const navItems = wrapper.findAll('a.nav-item');
        expect(navItems[0].classes()).not.toContain('active');
        expect(navItems[1].classes()).toContain('active');
    });

    it('does not highlight any item when on an unrelated route', async () => {
        const { wrapper } = mountComponent({ path: '/other', name: 'AnotherView' });
        await wrapper.vm.$nextTick();

        const navItems = wrapper.findAll('a.nav-item');
        expect(navItems[0].classes()).not.toContain('active');
        expect(navItems[1].classes()).not.toContain('active');
    });

    it('toggles sidebar when more button is clicked', async () => {
        const { wrapper } = mountComponent();
        const moreBtn = wrapper.find('.more-btn');

        expect(wrapper.vm.sidebarVisible).toBe(false);
        await moreBtn.trigger('click');
        expect(wrapper.vm.sidebarVisible).toBe(true);

        await moreBtn.trigger('click');
        expect(wrapper.vm.sidebarVisible).toBe(false);
    });
});
