<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { useUserSessionStore } from '@/stores/UserSession'
import { useEventBus } from '@/stores/EventStore.ts'
import { useI18n } from 'vue-i18n'
import ManagerLayout from '@/layouts/manager.vue'
import ProjectLayout from '@/layouts/project.vue'
import TenantLayout from '@/layouts/tenant.vue'
import ContractorLayout from '@/layouts/contractor.vue'
import PublicLayout from '@/layouts/public.vue'

type LayoutKey = 'manager' | 'project' | 'tenant' | 'contractor' | 'public'

const layouts: Record<LayoutKey, Component> = {
  manager: ManagerLayout,
  project: ProjectLayout,
  tenant: TenantLayout,
  contractor: ContractorLayout,
  public: PublicLayout,
}

const route = useRoute()
const router = useRouter()
const currentLayout = computed(() => layouts[(route.meta.layout as LayoutKey) ?? 'public'])

const { t } = useI18n()
const toast = useToast()
const bus = useEventBus()
const sessionStore = useUserSessionStore()

bus.on('toast:translate', ({ severity, summary, detail }) => {
  bus.emit('toast:show', {
 severity, summary: t(summary), detail: t(detail) 
})
})
bus.on('toast:show', ({ severity, summary, detail }) => {
  toast.add({
 severity, summary, detail, life: 3000 
})
})
bus.on('auth:session-expired', () => {
  sessionStore.user = null
  bus.emit('toast:translate', {
    severity: 'warn',
    summary: 'auth.sessionExpiredSummary',
    detail: 'auth.sessionExpiredDetail',
  })
  const targetPath = router.currentRoute.value.fullPath
  router.push({
    name: 'LandingPage',
    query: { redirect: targetPath !== '/' ? targetPath : undefined },
  })
})
</script>

<template>
  <component :is="currentLayout">
    <RouterView :key="route.fullPath" />
  </component>
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
