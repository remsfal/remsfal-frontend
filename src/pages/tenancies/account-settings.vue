<route lang="yaml">
name: TenantAccountSettings
meta:
  layout: tenant
  requiresAuth: true
</route>

<script setup lang="ts">
import AccountSettingsView from '@/views/AccountSettingsView.vue'
</script>

<template>
  <AccountSettingsView />
</template>
