<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import AppTopbar from './AppTopbar.vue';
import AppFooter from './AppFooter.vue';
import AppSidebar from './AppSidebar.vue';
import { useLayout } from '@/layout/composables/layout';
import { RouterView } from 'vue-router';
import Toast from 'primevue/toast';

const { layoutConfig, layoutState, isSidebarActive, setFullscreen } = useLayout();

const outsideClickListener = ref<EventListenerOrEventListenerObject | null>(null);

setFullscreen(false);

watch(isSidebarActive, (newVal) => {
  if (newVal) {
    bindOutsideClickListener();
  } else {
    unbindOutsideClickListener();
  }
});

const containerClass = computed(() => {
  return {
    'layout-theme-light': !layoutConfig.darkTheme,
    'layout-theme-dark': layoutConfig.darkTheme,
    'layout-overlay': layoutConfig.menuMode.value === 'overlay',
    'layout-static': layoutConfig.menuMode.value === 'static',
    'layout-static-inactive':
      layoutState.staticMenuDesktopInactive.value && layoutConfig.menuMode.value === 'static',
    'layout-overlay-active': layoutState.overlayMenuActive.value,
    'layout-mobile-active': layoutState.staticMenuMobileActive.value,
    'p-ripple-disabled': !layoutConfig.ripple.value,
  };
});
const bindOutsideClickListener = () => {
  if (!outsideClickListener.value) {
    outsideClickListener.value = (event: Event) => {
      if (isOutsideClicked(event)) {
        layoutState.overlayMenuActive.value = false;
        layoutState.staticMenuMobileActive.value = false;
        layoutState.menuHoverActive.value = false;
      }
    };
    document.addEventListener('click', outsideClickListener.value, undefined);
  }
};
const unbindOutsideClickListener = () => {
  if (outsideClickListener.value) {
    document.removeEventListener('click', outsideClickListener.value, undefined);
    outsideClickListener.value = null;
  }
};
const isOutsideClicked = (event: Event) => {
  const sidebarEl = document.querySelector('.layout-sidebar');
  const topbarEl = document.querySelector('.layout-menu-button');

  return !(
    sidebarEl!.isSameNode(event.target as Node) ||
    sidebarEl!.contains(event.target as Node) ||
    topbarEl!.isSameNode(event.target as Node) ||
    topbarEl!.contains(event.target as Node)
  );
};
</script>

<template>
  <div class="layout-wrapper" :class="containerClass">
    <AppTopbar></AppTopbar>
    <AppSidebar></AppSidebar>
    <div class="layout-main-container">
      <main>
        <div class="layout-main">
          <RouterView></RouterView>
        </div>
      </main>
      <AppFooter></AppFooter>
    </div>
    <div class="layout-mask"></div>
  </div>
  <Toast />
</template>
