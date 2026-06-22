<script setup lang="ts">
import AppRoleLayout from '@/layouts/components/AppRoleLayout.vue'
import ManagerTopbar from '@/layouts/components/ManagerTopbar.vue'
import ProjectMenu from '@/layouts/components/ProjectMenu.vue'
import ProjectMobileBar from '@/layouts/components/ProjectMobileBar.vue'
</script>

<template>
  <AppRoleLayout>
    <template #topbar><ManagerTopbar /></template>
    <template #menu><ProjectMenu /></template>
    <template #mobilebar><ProjectMobileBar class="layout-mobile-navbar" /></template>
    <slot />
  </AppRoleLayout>
</template>
