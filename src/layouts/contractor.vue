<script setup lang="ts">
import AppRoleLayout from '@/layouts/components/AppRoleLayout.vue'
import AppSimpleTopbar from '@/layouts/components/AppSimpleTopbar.vue'
import ContractorMenu from '@/layouts/components/ContractorMenu.vue'
import ContractorMobileBar from '@/layouts/components/ContractorMobileBar.vue'
</script>

<template>
  <AppRoleLayout>
    <template #topbar><AppSimpleTopbar /></template>
    <template #menu><ContractorMenu /></template>
    <template #mobilebar><ContractorMobileBar class="layout-mobile-navbar" /></template>
    <slot />
  </AppRoleLayout>
</template>
