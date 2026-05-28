<route lang="yaml">
name: ManagerOrganizations
meta:
  layout: manager
  requiresAuth: true
</route>

<script setup lang="ts">
import ManagerOrganizationsView from '@/views/ManagerOrganizationsView.vue'
</script>

<template>
  <ManagerOrganizationsView />
</template>
