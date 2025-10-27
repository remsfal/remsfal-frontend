<script setup lang="ts">
import { computed } from 'vue';
import { RouterView } from 'vue-router';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { useLayout } from '@/layout/composables/layout';
import { useProjectStore } from '@/stores/ProjectStore';
import { useUserSessionStore } from '@/stores/UserSession';
import { useEventBus } from '@/stores/EventStore.ts';
import { useI18n } from 'vue-i18n';

defineOptions({
  created() {
    const sessionStore = useUserSessionStore();
    sessionStore.refreshSessionState();
    const projectStore = useProjectStore();
    projectStore.refreshProjectList();
    console.log('App created!');
  },
});

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
bus.on('toast:translate', ({ severity, summary, detail }) => {
  bus.emit('toast:show', { severity: severity, summary: t(summary), detail: t(detail) });
});
bus.on('toast:show', ({ severity, summary, detail }) => {
  toast.add({
    severity: severity,
    summary: summary,
    detail: detail,
    life: 3000,
  });
});
</script>

<template>
  <div
    class="layout-wrapper"
    :class="containerClass"
  >
    <!-- Sakai AppLayout used as Named Router View -->
    <RouterView name="topbar" />
    <RouterView name="sidebar" />
    <RouterView />
    <div class="layout-mask animate-fadein" />
  </div>
  <Toast />
</template>
