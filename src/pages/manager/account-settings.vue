<route lang="yaml">
name: ManagerAccountSettings
meta:
  layout: manager
  requiresAuth: true
</route>

<script setup lang="ts">
import AccountSettingsView from '@/views/AccountSettingsView.vue'
</script>

<template>
  <AccountSettingsView />
</template>
