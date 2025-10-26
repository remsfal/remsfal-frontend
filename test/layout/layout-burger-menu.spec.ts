import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import AppLayout from '@/layout/AppLayout.vue';
import { useLayout } from '@/layout/composables/layout';

// Mock window.innerWidth for mobile testing
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 375, // Mobile width
});

describe('Burger Menu Mobile Behavior - Bug Fix', () => {
  beforeEach(() => {
    // Reset window width to mobile
    window.innerWidth = 375;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should toggle mobile menu correctly on mobile devices', () => {
    const { layoutState, toggleMenu } = useLayout();

    // Initial state should be closed
    expect(layoutState.staticMenuMobileActive).toBe(false);

    // Toggle to open
    toggleMenu();
    expect(layoutState.staticMenuMobileActive).toBe(true);

    // Toggle to close
    toggleMenu();
    expect(layoutState.staticMenuMobileActive).toBe(false);
  });

  it('should handle outside click gracefully when DOM elements are missing', async () => {
    const wrapper = mount(AppLayout, {
      props: {
        fullscreen: false,
      },
    });

    const { layoutState, toggleMenu } = useLayout();

    // Set mobile width
    window.innerWidth = 375;

    // Open mobile menu
    toggleMenu();
    await nextTick();
    expect(layoutState.staticMenuMobileActive).toBe(true);

    // Create a click event on an element that definitely exists (document.body)
    const clickEvent = new Event('click', { bubbles: true });
    Object.defineProperty(clickEvent, 'target', {
      value: document.body,
      enumerable: true,
    });

    // This should not crash even if layout elements don't exist in the test DOM
    expect(() => {
      document.dispatchEvent(clickEvent);
    }).not.toThrow();

    // Wait for the event to be processed
    await nextTick();

    // The menu should close (since body is outside the menu)
    expect(layoutState.staticMenuMobileActive).toBe(false);
  });

  it('should distinguish between mobile and desktop mode correctly', () => {
    const { layoutState, toggleMenu } = useLayout();

    // Test mobile behavior
    window.innerWidth = 375; // Mobile
    layoutState.staticMenuMobileActive = false;
    layoutState.staticMenuDesktopInactive = false;
    
    toggleMenu();
    expect(layoutState.staticMenuMobileActive).toBe(true);
    expect(layoutState.staticMenuDesktopInactive).toBe(false);

    // Reset state
    toggleMenu();
    expect(layoutState.staticMenuMobileActive).toBe(false);

    // Test desktop behavior  
    window.innerWidth = 1200; // Desktop
    toggleMenu();
    expect(layoutState.staticMenuDesktopInactive).toBe(true);
    expect(layoutState.staticMenuMobileActive).toBe(false);
  });

  it('should bind and unbind outside click listener based on sidebar state', async () => {
    const mockAddEventListener = vi.spyOn(document, 'addEventListener');
    const mockRemoveEventListener = vi.spyOn(document, 'removeEventListener');

    const wrapper = mount(AppLayout, {
      props: {
        fullscreen: false,
      },
    });

    const { layoutState, toggleMenu } = useLayout();
    window.innerWidth = 375;

    // Open menu - should bind listener
    toggleMenu();
    await nextTick();

    expect(mockAddEventListener).toHaveBeenCalledWith('click', expect.any(Function));

    // Close menu - should unbind listener
    toggleMenu();
    await nextTick();

    expect(mockRemoveEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  });
});