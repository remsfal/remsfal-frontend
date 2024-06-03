import { toRefs, reactive, computed } from 'vue';

const layoutConfig = reactive({
    ripple: false,
    darkTheme: false,
    inputStyle: 'filled',
    menuMode: 'static',
    theme: 'aura-light-green',
    scale: 14,
    activeMenuItem: null,
    fullscreen: true
});

const layoutState = reactive({
    staticMenuDesktopInactive: true,
    overlayMenuActive: false,
    profileSidebarVisible: false,
    configSidebarVisible: false,
    staticMenuMobileActive: false,
    menuHoverActive: false
});

export function useLayout() {
    const setFullscreen = (fullscreen) => {
        layoutConfig.fullscreen = fullscreen;
        layoutState.staticMenuDesktopInactive = fullscreen;
    };

    const setScale = (scale) => {
        layoutConfig.scale = scale;
    };

    const setActiveMenuItem = (item) => {
        layoutConfig.activeMenuItem = item.value || item;
    };

    const onMenuToggle = () => {
        if (layoutConfig.menuMode === 'overlay') {
            layoutState.overlayMenuActive = !layoutState.overlayMenuActive;
        }

        if (window.innerWidth > 991) {
            layoutState.staticMenuDesktopInactive = !layoutState.staticMenuDesktopInactive;
        } else {
            layoutState.staticMenuMobileActive = !layoutState.staticMenuMobileActive;
        }
    };

    const isSidebarActive = computed(() => layoutState.overlayMenuActive || layoutState.staticMenuMobileActive);

    const isDarkTheme = computed(() => layoutConfig.darkTheme);

    return { layoutConfig: toRefs(layoutConfig), layoutState: toRefs(layoutState), setFullscreen, setScale, onMenuToggle, isSidebarActive, isDarkTheme, setActiveMenuItem };
}
