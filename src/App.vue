<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { useLayout } from '@/layout/composables/layout';
import { useProjectStore } from '@/stores/ProjectStore';
import { useUserSessionStore } from '@/stores/UserSession';
import { useEventBus } from '@/stores/EventStore';
import { useI18n } from 'vue-i18n';

// --- FIX: Interface gegen "Unexpected any" ---
interface ToastEvent {
  severity: string;
  summary: string;
  detail: string;
}

defineOptions({
  created() {
    const sessionStore = useUserSessionStore();
    sessionStore.refreshSessionState();
    const projectStore = useProjectStore();
    projectStore.refreshProjectList();
    console.log('App created!');
  },
});

const route = useRoute();
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

/* --------------------------------------------------------------------------
   EVENT BUS HANDLER
-------------------------------------------------------------------------- */

// Hier nutzen wir das Interface -> SonarCloud ist glücklich
const handleToastTranslate = ({ severity, summary, detail }: ToastEvent) => {
  bus.emit('toast:show', {
    severity: severity,
    summary: t(summary),
    detail: t(detail),
  });
};

const handleToastShow = ({ severity, summary, detail }: ToastEvent) => {
  toast.add({
    // Cast ist notwendig für PrimeVue, aber sicher
    severity: severity as 'success' | 'info' | 'warn' | 'error',
    summary: summary,
    detail: detail,
    life: 3000,
  });
};

/* --------------------------------------------------------------------------
   LIFECYCLE HOOKS
-------------------------------------------------------------------------- */

onMounted(() => {
  bus.on('toast:translate', handleToastTranslate);
  bus.on('toast:show', handleToastShow);
});

onBeforeUnmount(() => {
  bus.off('toast:translate', handleToastTranslate);
  bus.off('toast:show', handleToastShow);
});
</script>

<template>
  <div class="layout-wrapper" :class="containerClass">
    <RouterView name="topbar" />
    <RouterView name="sidebar" />
    
    <RouterView :key="route.fullPath" />
    
    <div class="layout-mask animate-fadein" />
  </div>
  <Toast />
</template>