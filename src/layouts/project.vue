<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import AppRoleLayout from '@/layouts/components/AppRoleLayout.vue'
import ManagerTopbar from '@/layouts/components/ManagerTopbar.vue'
import ProjectMenu from '@/layouts/components/ProjectMenu.vue'
import ProjectMobileBar from '@/layouts/components/ProjectMobileBar.vue'
import { useRentableUnitsStore } from '@/features/project/rentableUnits/stores/RentableUnitsStore'

const route = useRoute()
const rentableUnitsStore = useRentableUnitsStore()
watch(
  [() => (route.params as Record<string, string>).projectId, () => rentableUnitsStore.version],
  ([projectId]) => {
    if (!projectId) return
    void rentableUnitsStore.fetchRentalUnitTree(projectId).catch((error) => {
      console.error('Failed to load rentable unit tree:', error)
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
