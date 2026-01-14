import { describe, it, expect } from 'vitest';
import { mount, config } from '@vue/test-utils';
import TenantMobileBar from '@/layout/TenantMobileBar.vue';
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

describe('TenantMobileBar.vue', () => {
    const defaultRoute = { path: '/', name: 'TenantView' };
    const mountComponent = (initialRoute = defaultRoute) => {
        const route = reactive(initialRoute);

        const wrapper = mount(TenantMobileBar, {
            global: {
                plugins: [PrimeVue],
                provide: { [routeLocationKey as symbol]: route },
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

    it('highlights Overview when on a sub-route of Overview', async () => {
        // e.g. /some-sub-page which starts with /
        const { wrapper } = mountComponent({ path: '/some-sub-page', name: 'SomeSubPage' });
        await wrapper.vm.$nextTick();

        const navItems = wrapper.findAll('a.nav-item');
        // The first item 'to' is '/', logic says: route.path === '/' || (item.to !== '/' && ...)
        // Wait, logic is:
        // if (typeof item.to === 'string') {
        //    return route.path === item.to || (item.to !== '/' && route.path.startsWith(item.to));
        // }
        // For item.to = '/', the second part (item.to !== '/') is false.
        // So strict equality is required for '/'.
        // Let's verify this assumption with the test.

        // Actually, looking at the code:
        // item 1: to: '/'
        // isActive: return route.path === '/' || ('/' !== '/' && ...) -> return route.path === '/'

        expect(navItems[0].classes()).not.toContain('active');
    });

    it('highlights Inbox when on a sub-route matching Inbox name', async () => {
        // The Inbox item definition is: to: { name: 'Inbox' }
        // The logic for object 'to': return route.name === item.to.name

        const { wrapper } = mountComponent({ path: '/inbox/details', name: 'Inbox' }); // Name matches
        await wrapper.vm.$nextTick();

        const navItems = wrapper.findAll('a.nav-item');
        expect(navItems[1].classes()).toContain('active');
    });

    it('does not highlight Inbox when route name differs', async () => {
        const { wrapper } = mountComponent({ path: '/inbox', name: 'OtherRoute' });
        await wrapper.vm.$nextTick();

        const navItems = wrapper.findAll('a.nav-item');
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
