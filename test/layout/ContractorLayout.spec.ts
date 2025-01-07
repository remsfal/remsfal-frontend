import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import ContractorLayout from '../../src/layout/ContractorLayout.vue';
import ContractorTopbar from '../../src/layout/ContractorTopbar.vue';
import AppFooter from '../../src/layout/AppFooter.vue';
import ContractorMenu from '../../src/layout/ContractorMenu.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';

describe('ContractorLayout.vue', () => {
  let router;
  const pinia = createPinia();

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/contractor', name: 'contractor', component: { template: '<div>Contractor Page</div>' } },
      ],
    });
  });

  it('should render the layout components correctly', async () => {
    const wrapper = mount(ContractorLayout, {
      global: {
        plugins: [pinia, router],
      },
    });

    const topbar = wrapper.findComponent(ContractorTopbar);
    expect(topbar.exists()).toBe(true);

    const sidebar = wrapper.findComponent(ContractorMenu);
    expect(sidebar.exists()).toBe(true);

    const footer = wrapper.findComponent(AppFooter);
    expect(footer.exists()).toBe(true);

    await router.push('/contractor');
    await wrapper.vm.$nextTick();

    const routerViewContent = wrapper.html();
    expect(routerViewContent).toContain('Contractor Page');
  });

  it('should display correct content for the contractor route', async () => {
    const wrapper = mount(ContractorLayout, {
      global: {
        plugins: [pinia, router],
      },
    });

    await router.push('/contractor');
    await wrapper.vm.$nextTick();

    const routerViewContent = wrapper.html();
    expect(routerViewContent).toContain('Contractor Page');
  });
});
