<script setup lang="ts">
import { computed } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { useLayout } from '@/layout/composables/layout';
import { useUserSessionStore } from '@/stores/UserSession';
import { useEventBus } from '@/stores/EventStore.ts';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const router = useRouter();
const { layoutConfig, layoutState } = useLayout();

const containerClass = computed(() => {
  return {
    'layout-overlay': layoutConfig.menuMode === 'overlay',
    'layout-static': layoutConfig.menuMode === 'static',
    'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
    'layout-overlay-active': layoutState.overlayMenuActive,
    'layout-mobile-active': layoutState.staticMenuMobileActive,
  };
});

const { t } = useI18n();
const toast = useToast();
const bus = useEventBus();
const sessionStore = useUserSessionStore();

bus.on('toast:translate', ({ severity, summary, detail }) => {
  bus.emit('toast:show', {
 severity, summary: t(summary), detail: t(detail) 
});
});
bus.on('toast:show', ({ severity, summary, detail }) => {
  toast.add({
 severity, summary, detail, life: 3000 
});
});
bus.on('auth:session-expired', () => {
  sessionStore.user = null;
  bus.emit('toast:translate', {
    severity: 'warn',
    summary: 'auth.sessionExpiredSummary',
    detail: 'auth.sessionExpiredDetail',
  });
  const targetPath = router.currentRoute.value.fullPath;
  router.push({
    name: 'LandingPage',
    query: { redirect: targetPath !== '/' ? targetPath : undefined },
  });
});
</script>

<template>
  <div class="layout-wrapper" :class="containerClass">
    <RouterView name="topbar" />

    <div class="layout-sidebar-wrapper">
      <RouterView name="sidebar" />
    </div>

    <RouterView :key="route.fullPath" />

    <RouterView name="mobilebar" class="layout-mobile-navbar" />

    <div class="layout-mask animate-fadein" />
  </div>
  <Toast />
</template>

<style lang="scss">

.layout-mobile-navbar {
  display: none;
}

.layout-sidebar-wrapper {
  display: block;
}

@media (width <= 991px) {
  .layout-mobile-navbar {
    display: flex !important;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 1100;
  }

  .layout-sidebar-wrapper {
    display: none !important;
  }

  .layout-main {
    padding-bottom: 80px !important;
  }
}
</style>