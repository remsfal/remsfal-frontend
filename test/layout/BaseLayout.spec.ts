import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BaseLayout from '../../src/layout/BaseLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';
import { ref } from 'vue';

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
      isSidebarActive: ref(false),
      setFullscreen: vi.fn(),
    })),
  }));

describe('BaseLayout.vue', () => {
  let router;
  const pinia = createPinia();

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [{ path: '/', name: 'home', component: { template: '<div>Home</div>' } }],
    });
  });

  it('should render slots correctly', () => {
    const wrapper = mount(BaseLayout, {
      global: {
        plugins: [router, pinia],
      },
      slots: {
        topbar: '<div class="slot-topbar">Topbar Content</div>',
        sidebar: '<div class="slot-sidebar">Sidebar Content</div>',
        content: '<div class="slot-content">Content Area</div>',
        footer: '<div class="slot-footer">Footer Content</div>',
      },
    });

    expect(wrapper.find('.slot-topbar').exists()).toBe(true);
    expect(wrapper.find('.slot-topbar').text()).toBe('Topbar Content');

    expect(wrapper.find('.slot-sidebar').exists()).toBe(true);
    expect(wrapper.find('.slot-sidebar').text()).toBe('Sidebar Content');

    expect(wrapper.find('.slot-content').exists()).toBe(true);
    expect(wrapper.find('.slot-content').text()).toBe('Content Area');

    expect(wrapper.find('.slot-footer').exists()).toBe(true);
    expect(wrapper.find('.slot-footer').text()).toBe('Footer Content');
  });

  it('should apply correct classes based on layoutConfig', async () => {
    const wrapper = mount(BaseLayout, {
      global: {
        plugins: [router, pinia],
      },
    });

    const container = wrapper.find('.layout-wrapper');
    expect(container.classes()).toContain('layout-theme-light');
    expect(container.classes()).toContain('layout-static');
    expect(container.classes()).not.toContain('layout-overlay');
  });
});
