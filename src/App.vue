<script setup lang="ts">
import { computed, watch } from 'vue'
import type { Component } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { useUserSessionStore } from '@/stores/UserSession'
import { useEventBus } from '@/stores/EventStore'
import { useI18n } from 'vue-i18n'
import { TOAST_LIFE, type AppToastSeverity } from '@/composables/useAppToast'
import { clearUserClientData } from '@/helper/clientDataCleanup'
import ManagerLayout from '@/layouts/manager.vue'
import ProjectLayout from '@/layouts/project.vue'
import TenantLayout from '@/layouts/tenant.vue'
import ContractorLayout from '@/layouts/contractor.vue'
import PublicLayout from '@/layouts/public.vue'
import AuthLayout from '@/layouts/auth.vue'
import { registerPush } from '@/features/common/push'

type LayoutKey = 'manager' | 'project' | 'tenant' | 'contractor' | 'public' | 'auth'

const layouts: Record<LayoutKey, Component> = {
  manager: ManagerLayout,
  project: ProjectLayout,
  tenant: TenantLayout,
  contractor: ContractorLayout,
  public: PublicLayout,
  auth: AuthLayout,
}

const route = useRoute()
const router = useRouter()
const currentLayout = computed(() => layouts[(route.meta.layout as LayoutKey) ?? 'public'])

const { t } = useI18n()
const toast = useToast()
const bus = useEventBus()
const sessionStore = useUserSessionStore()

watch(
  () => sessionStore.user,
  (user) => {
    if (!user) return
    registerPush()
      .then((result) => {
        if (result === 'registered') {
          console.log('[push] registered')
        } else {
          console.warn('[push] not registered, reason:', result)
        }
      })
      .catch((error) => console.warn('[push] auto registration failed', error))
  },
  { immediate: true },
)

bus.on('toast:translate', ({ severity, summary, detail }) => {
  bus.emit('toast:show', {
    severity, summary: t(summary), detail: t(detail) 
  })
})
bus.on('toast:show', ({ severity, summary, detail }) => {
  toast.add({
    severity, summary, detail, life: TOAST_LIFE[severity as AppToastSeverity] ?? TOAST_LIFE.error
  })
})
bus.on('auth:session-expired', () => {
  sessionStore.user = null
  // Only emitted when the session cannot be renewed (not when the server is unreachable),
  // so no user-specific data may stay behind — regardless of the current route.
  void clearUserClientData()
  // An anonymous visit to a public page (e.g. an unawaited background fetch failing
  // at boot) also triggers this event, but there's no active session to lose there —
  // only bounce the user out when they were actually on a page that requires auth.
  if (!router.currentRoute.value.meta.requiresAuth) {
    return
  }
  bus.emit('toast:translate', {
    severity: 'warn',
    summary: 'auth.sessionExpiredSummary',
    detail: 'auth.sessionExpiredDetail',
  })
  const targetPath = router.currentRoute.value.fullPath
  router.push({
    name: 'Login',
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
}
</style>
