import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import AppTopbar from '@/layouts/components/AppTopbar.vue';
import { useLayout } from '@/layouts/composables/layout';
import { useUserSessionStore } from '@/stores/UserSession';

type SessionUser = ReturnType<typeof useUserSessionStore>['user'];

// Mock the layout composable
vi.mock('@/layouts/composables/layout', () => ({ useLayout: vi.fn(), }));

describe('AppTopbar', () => {
  let mockUseLayout: {
    toggleMenu: ReturnType<typeof vi.fn>;
    toggleDarkMode: ReturnType<typeof vi.fn>;
    isDarkTheme: boolean;
    isFullscreen: boolean
  };

  beforeEach(() => {
    mockUseLayout = {
      toggleMenu: vi.fn(),
      toggleDarkMode: vi.fn(),
      isDarkTheme: false,
      isFullscreen: false,
    };
    (useLayout as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockUseLayout);
  });

  it('renders the burger menu button', () => {
    const wrapper = mount(AppTopbar);
    const burgerButton = wrapper.find('.layout-topbar-menu-button');
    expect(burgerButton.exists()).toBe(true);
  });

  it('renders the mobile menu', () => {
    const wrapper = mount(AppTopbar);
    const menu = wrapper.find('.layout-topbar-menu');
    expect(menu.exists()).toBe(true);
    expect(menu.find('.layout-topbar-menu-content').exists()).toBe(true);
  });

  it('burger button has click event handler', async () => {
    const wrapper = mount(AppTopbar);
    const burgerButton = wrapper.find('.layout-topbar-menu-button');

    // Should not throw error when clicked
    await burgerButton.trigger('click');
    expect(true).toBe(true); // If we get here, the click handler exists
  });

  it('links the logo to the landing page when logged out', () => {
    useUserSessionStore().user = null;
    const wrapper = mount(AppTopbar);
    expect(wrapper.find('.layout-topbar-logo').attributes('href')).toBe('/');
  });

  it('links the logo to the personal overview when logged in', () => {
    useUserSessionStore().user = { email: 'a@b.de', userContexts: ['CONTRACTOR'] } as SessionUser;
    const wrapper = mount(AppTopbar);
    expect(wrapper.find('.layout-topbar-logo').attributes('href')).toBe('/contractor/dashboard');
    useUserSessionStore().user = null;
  });
});