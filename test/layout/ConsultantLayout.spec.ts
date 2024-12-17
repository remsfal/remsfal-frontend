import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ConsultantLayout from '../../src/layout/ConsultantLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';

vi.mock('@/layout/composables/layout', () => ({
    useLayout: vi.fn(() => ({
      layoutConfig: {
        darkTheme: false,
        menuMode: { value: 'static' },
        ripple: { value: true },
        fullscreen: { value: false },
      },
      layoutState: {
        staticMenuDesktopInactive: { value: false },
        overlayMenuActive: { value: false },
        staticMenuMobileActive: { value: false },
        menuHoverActive: { value: false },
      },
      isSidebarActive: false,
      setFullscreen: vi.fn(),
    })),
  }));

describe('ConsultantLayout.vue', () => {
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

  it('should render all layout components', async () => {
    const wrapper = mount(ConsultantLayout, {
      global: {
        plugins: [pinia, router],
      },
    });

    expect(wrapper.findComponent({ name: 'AppTopbar' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'AppFooter' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'ConsultantMenu' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'RouterView' }).exists()).toBe(true);
  });

  it('should apply the correct layout class based on layoutConfig', async () => {
    const wrapper = mount(ConsultantLayout, {
      global: {
        plugins: [pinia, router],
      },
    });
  
    await wrapper.vm.$nextTick();
  
    const containerClass = (wrapper.vm as any).containerClass;
  
    expect(containerClass['layout-theme-light']).toBe(true);
    expect(containerClass['layout-static']).toBe(true);
    expect(containerClass['layout-overlay']).toBe(false);
  });
});
