<script setup lang="ts">
import AppRoleLayout from '@/layouts/components/AppRoleLayout.vue'
import AppSimpleTopbar from '@/layouts/components/AppSimpleTopbar.vue'
import TenantMenu from '@/layouts/components/TenantMenu.vue'
import TenantMobileBar from '@/layouts/components/TenantMobileBar.vue'
</script>

<template>
  <AppRoleLayout>
    <template #topbar>
      <AppSimpleTopbar />
    </template>
    <template #menu>
      <TenantMenu />
    </template>
    <template #mobilebar>
      <TenantMobileBar class="layout-mobile-navbar" />
    </template>
    <slot />
  </AppRoleLayout>
</template>
