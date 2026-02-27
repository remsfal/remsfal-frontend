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

// Remove global router plugin for this test file
// We need manual control over routing
config.global.plugins = config.global.plugins.filter(p => p !== router);

// Stub for RouterLink
const RouterLinkStub = {
    template: '<a><slot /></a>',
    props: ['to']
};

describe('ManagerMobileBar.vue', () => {
    const defaultRoute = {
 path: '/manager/projects', name: 'ProjectSelection', params: {}, query: {} 
};
    const mountComponent = (initialRoute = defaultRoute) => {
        const route = reactive(initialRoute);

        const wrapper = mount(ManagerMobileBar, {
            global: {
                plugins: [PrimeVue],
                provide: { [routeLocationKey as symbol]: route },
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

    it('renders navigation items', () => {
        const { wrapper } = mountComponent();
        const navItems = wrapper.findAll('a.nav-item');
        expect(navItems.length).toBe(2);
    });

    it('renders Projekte and Einstellungen items', () => {
        const { wrapper } = mountComponent();
        const navItems = wrapper.findAll('a.nav-item');
        expect(navItems[0].text()).toContain('Projekte');
        expect(navItems[1].text()).toContain('Einstellungen');
    });

    it('highlights Projekte when on ProjectSelection route', async () => {
        const { wrapper } = mountComponent({
 path: '/manager/projects', name: 'ProjectSelection', params: {}, query: {} 
});
        await wrapper.vm.$nextTick();

        const navItems = wrapper.findAll('a.nav-item');
        expect(navItems[0].classes()).toContain('active');
        expect(navItems[1].classes()).not.toContain('active');
    });

    it('highlights Einstellungen when on ManagerAccountSettings route', async () => {
        const { wrapper } = mountComponent({
 path: '/manager/account-settings', name: 'ManagerAccountSettings', params: {}, query: {} 
});
        await wrapper.vm.$nextTick();

        const navItems = wrapper.findAll('a.nav-item');
        expect(navItems[0].classes()).not.toContain('active');
        expect(navItems[1].classes()).toContain('active');
    });

    it('does not highlight any item on an unrelated route', async () => {
        const { wrapper } = mountComponent({
 path: '/manager/other', name: 'SomeOtherRoute', params: {}, query: {} 
});
        await wrapper.vm.$nextTick();

        const navItems = wrapper.findAll('a.nav-item');
        expect(navItems[0].classes()).not.toContain('active');
        expect(navItems[1].classes()).not.toContain('active');
    });

    it('toggles sidebar', async () => {
        const { wrapper } = mountComponent();
        const moreBtn = wrapper.find('.more-btn');

        expect(wrapper.vm.sidebarVisible).toBe(false);
        await moreBtn.trigger('click');
        expect(wrapper.vm.sidebarVisible).toBe(true);

        await moreBtn.trigger('click');
        expect(wrapper.vm.sidebarVisible).toBe(false);
    });
});
