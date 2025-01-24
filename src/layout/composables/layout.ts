import { computed, reactive, ref, type Ref } from 'vue';

const layoutConfig = reactive({
  preset: 'Aura',
  primary: 'emerald',
  surface: null,
  darkTheme: false,
  menuMode: 'static',
});

const layoutState = reactive({
  staticMenuDesktopInactive: false,
  overlayMenuActive: false,
  profileSidebarVisible: false,
  configSidebarVisible: false,
  staticMenuMobileActive: false,
  menuHoverActive: false,
  activeMenuItem: ref<string | undefined>(undefined),
});

export function useLayout() {
  const setFullscreen = (fullscreen: boolean) => {
    layoutState.staticMenuDesktopInactive = fullscreen;
  };

  const setActiveMenuItem = (
    item: string | Ref<string | undefined, string | undefined> | undefined,
  ) => {
    if (item !== undefined && typeof item !== 'string') {
      layoutState.activeMenuItem = item.value;
    } else {
      layoutState.activeMenuItem = item;
    }
  };

  const toggleDarkMode = () => {
    if (!document.startViewTransition) {
      executeDarkModeToggle();

      return;
    }

    document.startViewTransition(() => executeDarkModeToggle());
  };

  const executeDarkModeToggle = () => {
    layoutConfig.darkTheme = !layoutConfig.darkTheme;
    document.documentElement.classList.toggle('app-dark');
  };

  const toggleMenu = () => {
    if (layoutConfig.menuMode === 'overlay') {
      layoutState.overlayMenuActive = !layoutState.overlayMenuActive;
    }

    if (window.innerWidth > 991) {
      layoutState.staticMenuDesktopInactive = !layoutState.staticMenuDesktopInactive;
    } else {
      layoutState.staticMenuMobileActive = !layoutState.staticMenuMobileActive;
    }
  };

  const isSidebarActive = computed(
    () => layoutState.overlayMenuActive || layoutState.staticMenuMobileActive,
  );

  const isDarkTheme = computed(() => layoutConfig.darkTheme);

  const isFullscreen = computed(() => layoutState.staticMenuDesktopInactive);

  const getPrimary = computed(() => layoutConfig.primary);

  const getSurface = computed(() => layoutConfig.surface);

  return {
    layoutConfig,
    layoutState,
    toggleMenu,
    isSidebarActive,
    isDarkTheme,
    isFullscreen,
    getPrimary,
    getSurface,
    setActiveMenuItem,
    setFullscreen,
    toggleDarkMode,
  };
}
