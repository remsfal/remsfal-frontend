<script setup lang="ts">
import AppRoleLayout from '@/layouts/components/AppRoleLayout.vue'
import ManagerTopbar from '@/layouts/components/ManagerTopbar.vue'
import ManagerMenu from '@/layouts/components/ManagerMenu.vue'
import ManagerMobileBar from '@/layouts/components/ManagerMobileBar.vue'
</script>

<template>
  <AppRoleLayout>
    <template #topbar>
      <ManagerTopbar />
    </template>
    <template #menu>
      <ManagerMenu />
    </template>
    <template #mobilebar>
      <ManagerMobileBar class="layout-mobile-navbar" />
    </template>
    <slot />
  </AppRoleLayout>
</template>
