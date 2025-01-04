import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import ContractorLayout from '../../src/layout/ContractorLayout.vue';
import BaseLayout from '../../src/layout/BaseLayout.vue';
import AppTopbar from '../../src/layout/AppTopbar.vue';
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

  it('should render BaseLayout with the correct slot components', async () => {
    const wrapper = mount(ContractorLayout, {
      global: {
        plugins: [pinia, router],
      },
    });

    const baseLayout = wrapper.findComponent(BaseLayout);
    expect(baseLayout.exists()).toBe(true);

    const topbar = baseLayout.findComponent(AppTopbar);
    expect(topbar.exists()).toBe(true);

    const sidebar = baseLayout.findComponent(ContractorMenu);
    expect(sidebar.exists()).toBe(true);

    const footer = baseLayout.findComponent(AppFooter);
    expect(footer.exists()).toBe(true);
  });
});
