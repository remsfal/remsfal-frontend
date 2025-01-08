<script setup lang="ts">
import { computed, watch } from 'vue';
import ContractorTopbar from './ContractorTopbar.vue';
import AppFooter from './AppFooter.vue';
import ContractorMenu from './ContractorMenu.vue';
import { useLayout } from '@/layout/composables/layout';
import { RouterView } from 'vue-router';

const {
  layoutConfig,
  layoutState,
  isSidebarActive,
  setFullscreen,
  bindOutsideClickListener,
  unbindOutsideClickListener,
} = useLayout();
setFullscreen(false);

watch(isSidebarActive, (newVal) => {
  if (newVal) {
    bindOutsideClickListener(() => {
      layoutState.overlayMenuActive.value = false;
      layoutState.staticMenuMobileActive.value = false;
      layoutState.menuHoverActive.value = false;
    });
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
</script>

<template>
  <div class="layout-wrapper" :class="containerClass">
    <ContractorTopbar></ContractorTopbar>
    <div class="layout-sidebar">
      <ContractorMenu></ContractorMenu>
    </div>
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
</template>