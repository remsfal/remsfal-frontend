import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ContractorMobileBar from '@/layout/ContractorMobileBar.vue';
import PrimeVue from 'primevue/config';
import { reactive } from 'vue';
import { routeLocationKey } from 'vue-router';
import { config } from '@vue/test-utils';
import router from '@/router';

// Remove global router plugin
config.global.plugins = config.global.plugins.filter(p => p !== router);

const RouterLinkStub = {
    template: '<a><slot /></a>',
    props: ['to']
};



describe('ContractorMobileBar.vue', () => {
    const mountComponent = (initialRoute = {
        name: 'ContractorView', query: {}, path: '/customers'
    }) => {
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

    it('highlights Overview active state correctly', async () => {
        const { wrapper } = mountComponent({
            name: 'ContractorView', query: {}, path: '/customers'
        });
        await wrapper.vm.$nextTick();

        const navItems = wrapper.findAll('a.nav-item');
        expect(navItems[0].classes()).toContain('active');
        expect(navItems[1].classes()).not.toContain('active');
    });

    it('highlights Orders active state correctly', async () => {
        const { wrapper } = mountComponent({
            name: 'ContractorView', query: { tab: 'orders' }, path: '/customers'
        });
        await wrapper.vm.$nextTick();

        const navItems = wrapper.findAll('a.nav-item');
        expect(navItems[0].classes()).not.toContain('active');
        expect(navItems[1].classes()).toContain('active');
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
