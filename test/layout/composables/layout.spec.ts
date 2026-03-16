import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref } from 'vue';
import { useLayout } from '@/layout/composables/layout';

describe('useLayout composable', () => {
  let layout: ReturnType<typeof useLayout>;

  beforeEach(() => {
    layout = useLayout();
    // Reset shared module-level state between tests
    layout.layoutState.staticMenuDesktopInactive = false;
    layout.layoutState.overlayMenuActive = false;
    layout.layoutState.activeMenuItem = undefined;
    layout.layoutConfig.menuMode = 'static';
    layout.layoutConfig.darkTheme = false;
    document.documentElement.classList.remove('app-dark');
  });

  describe('setFullscreen', () => {
    it('sets staticMenuDesktopInactive to true', () => {
      layout.setFullscreen(true);
      expect(layout.layoutState.staticMenuDesktopInactive).toBe(true);
    });

    it('sets staticMenuDesktopInactive to false', () => {
      layout.layoutState.staticMenuDesktopInactive = true;
      layout.setFullscreen(false);
      expect(layout.layoutState.staticMenuDesktopInactive).toBe(false);
    });
  });

  describe('setActiveMenuItem', () => {
    it('sets activeMenuItem to a string value', () => {
      layout.setActiveMenuItem('0-1');
      expect(layout.layoutState.activeMenuItem).toBe('0-1');
    });

    it('sets activeMenuItem from a Ref', () => {
      const itemRef = ref<string | undefined>('0-2');
      layout.setActiveMenuItem(itemRef);
      expect(layout.layoutState.activeMenuItem).toBe('0-2');
    });

    it('sets activeMenuItem to undefined', () => {
      layout.layoutState.activeMenuItem = '1';
      layout.setActiveMenuItem(undefined);
      expect(layout.layoutState.activeMenuItem).toBeUndefined();
    });
  });

  describe('toggleDarkMode', () => {
    it('toggles darkTheme from false to true', () => {
      layout.toggleDarkMode();
      expect(layout.layoutConfig.darkTheme).toBe(true);
    });

    it('toggles darkTheme from true to false', () => {
      layout.layoutConfig.darkTheme = true;
      layout.toggleDarkMode();
      expect(layout.layoutConfig.darkTheme).toBe(false);
    });

    it('adds app-dark class to document element when enabling dark mode', () => {
      layout.toggleDarkMode();
      expect(document.documentElement.classList.contains('app-dark')).toBe(true);
    });

    it('removes app-dark class from document element when disabling dark mode', () => {
      document.documentElement.classList.add('app-dark');
      layout.layoutConfig.darkTheme = true;
      layout.toggleDarkMode();
      expect(document.documentElement.classList.contains('app-dark')).toBe(false);
    });

    it('uses document.startViewTransition when available', () => {
      const mockTransition = vi.fn((cb: () => void) => cb());
      (document as Document & { startViewTransition?: (cb: () => void) => void }).startViewTransition = mockTransition;
      layout.toggleDarkMode();
      expect(mockTransition).toHaveBeenCalled();
      delete (document as Document & { startViewTransition?: (cb: () => void) => void }).startViewTransition;
    });
  });

  describe('toggleMenu', () => {
    it('toggles overlayMenuActive when in overlay mode', () => {
      layout.layoutConfig.menuMode = 'overlay';
      layout.toggleMenu();
      expect(layout.layoutState.overlayMenuActive).toBe(true);
    });

    it('toggles back overlayMenuActive when called again in overlay mode', () => {
      layout.layoutConfig.menuMode = 'overlay';
      layout.layoutState.overlayMenuActive = true;
      layout.toggleMenu();
      expect(layout.layoutState.overlayMenuActive).toBe(false);
    });

    it('toggles staticMenuDesktopInactive on wide viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
 value: 1200, writable: true, configurable: true 
});
      layout.toggleMenu();
      expect(layout.layoutState.staticMenuDesktopInactive).toBe(true);
    });
  });

  describe('computed isSidebarActive', () => {
    it('is false when both overlay and mobile menus are closed', () => {
      expect(layout.isSidebarActive.value).toBe(false);
    });

    it('is true when overlayMenuActive is true', () => {
      layout.layoutState.overlayMenuActive = true;
      expect(layout.isSidebarActive.value).toBe(true);
    });
  });

  describe('computed isDarkTheme', () => {
    it('returns false by default', () => {
      expect(layout.isDarkTheme.value).toBe(false);
    });

    it('returns true when darkTheme is enabled', () => {
      layout.layoutConfig.darkTheme = true;
      expect(layout.isDarkTheme.value).toBe(true);
    });
  });

  describe('computed isFullscreen', () => {
    it('returns false by default', () => {
      expect(layout.isFullscreen.value).toBe(false);
    });

    it('returns true when staticMenuDesktopInactive is true', () => {
      layout.layoutState.staticMenuDesktopInactive = true;
      expect(layout.isFullscreen.value).toBe(true);
    });
  });
});
