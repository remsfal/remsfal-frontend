<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue'; // <--- Hooks importiert
import { RouterView, useRoute } from 'vue-router';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { useLayout } from '@/layout/composables/layout';
import { useProjectStore } from '@/stores/ProjectStore';
import { useUserSessionStore } from '@/stores/UserSession';
import { useEventBus } from '@/stores/EventStore';
import { useI18n } from 'vue-i18n';

// Options-API Block kann so bleiben, kümmert sich um Initialisierung
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
   EVENT BUS HANDLER (Ausgelagert in Variablen)
   Damit bus.off() funktioniert, müssen wir exakt dieselbe Funktion übergeben.
   Anonyme Funktionen (() => {}) können nicht sauber entfernt werden.
-------------------------------------------------------------------------- */

const handleToastTranslate = ({ severity, summary, detail }: any) => {
  bus.emit('toast:show', {
    severity: severity,
    summary: t(summary),
    detail: t(detail),
  });
};

const handleToastShow = ({ severity, summary, detail }: any) => {
  toast.add({
    severity: severity,
    summary: summary,
    detail: detail,
    life: 3000,
  });
};

/* --------------------------------------------------------------------------
   LIFECYCLE HOOKS
-------------------------------------------------------------------------- */

onMounted(() => {
  // Listener registrieren, sobald die App bereit ist
  bus.on('toast:translate', handleToastTranslate);
  bus.on('toast:show', handleToastShow);
});

onBeforeUnmount(() => {
  // Listener entfernen, bevor die App zerstört wird (Cleanup)
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