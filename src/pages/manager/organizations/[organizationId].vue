<route lang="yaml">
name: ManagerOrganizationSettings
meta:
  layout: manager
  requiresAuth: true
</route>

<script setup lang="ts">
import ManagerOrganizationSettingsView from '@/views/ManagerOrganizationSettingsView.vue';
</script>

<template>
  <ManagerOrganizationSettingsView />
</template>
