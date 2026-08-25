<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import AppRoleLayout from '@/layouts/components/AppRoleLayout.vue'
import ManagerTopbar from '@/layouts/components/ManagerTopbar.vue'
import ProjectMenu from '@/layouts/components/ProjectMenu.vue'
import ProjectMobileBar from '@/layouts/components/ProjectMobileBar.vue'
import { useRentableUnitsStore } from '@/features/project/rentableUnits/stores/RentableUnitsStore'

const route = useRoute()
const toast = useToast()
const { t } = useI18n()
const rentableUnitsStore = useRentableUnitsStore()
watch(
  [() => (route.params as Record<string, string>).projectId, () => rentableUnitsStore.version],
  ([projectId]) => {
    if (!projectId) return
    void rentableUnitsStore.fetchRentalUnitTree(projectId).catch((error) => {
      console.error('Failed to load rentable unit tree:', error)
      toast.add({
        severity: 'error', summary: t('error.general'), detail: t('rentableUnits.loadError'), life: 6000,
      })
    })
  },
  { immediate: true },
)
</script>

<template>
  <AppRoleLayout>
    <template #topbar>
      <ManagerTopbar />
    </template>
    <template #menu>
      <ProjectMenu />
    </template>
    <template #mobilebar>
      <ProjectMobileBar class="layout-mobile-navbar" />
    </template>
    <slot />
  </AppRoleLayout>
</template>
