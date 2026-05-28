<route lang="yaml">
name: ManagerSettings
meta:
  layout: manager
  requiresAuth: true
</route>

<script setup lang="ts">
import ManagerSettingsView from '@/views/ManagerSettingsView.vue'
</script>

<template>
  <ManagerSettingsView />
</template>
