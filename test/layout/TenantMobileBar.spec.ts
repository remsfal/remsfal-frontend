import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TenantMobileBar from '@/layout/TenantMobileBar.vue';
import PrimeVue from 'primevue/config';
import { reactive } from 'vue';
import { routeLocationKey } from 'vue-router';
import { config } from '@vue/test-utils';
import router from '@/router';

// Remove global router plugin for this test file
// We need manual control over routing
config.global.plugins = config.global.plugins.filter(p => p !== router);

// Stub for RouterLink
const RouterLinkStub = {
    template: '<a><slot /></a>',
    props: ['to']
};

describe('TenantMobileBar.vue', () => {
    const mountComponent = (initialRoute = { path: '/', name: 'TenantView' }) => {
        const route = reactive(initialRoute);

        const wrapper = mount(TenantMobileBar, {
            global: {
                plugins: [PrimeVue],
                provide: {
                    [routeLocationKey as symbol]: route
                },
                stubs: {
                    TenantMenu: true,
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

    it('highlights Overview active state', async () => {
        const { wrapper } = mountComponent({ path: '/', name: 'TenantView' });
        await wrapper.vm.$nextTick();

        const navItems = wrapper.findAll('a.nav-item');
        expect(navItems[0].classes()).toContain('active');
        expect(navItems[1].classes()).not.toContain('active');
    });

    it('highlights Inbox active state', async () => {
        const { wrapper } = mountComponent({ path: '/inbox', name: 'Inbox' });
        await wrapper.vm.$nextTick();

        const navItems = wrapper.findAll('a.nav-item');

        expect(navItems[0].classes()).not.toContain('active');
        expect(navItems[1].classes()).toContain('active');
    });

    it('toggles sidebar', async () => {
        const { wrapper } = mountComponent();

        const moreBtn = wrapper.find('.more-btn');

        expect(wrapper.vm.sidebarVisible).toBe(false);
        await moreBtn.trigger('click');
        expect(wrapper.vm.sidebarVisible).toBe(true);
    });
});
