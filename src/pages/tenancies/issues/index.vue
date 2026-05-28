<route lang="yaml">
name: TenantIssues
meta:
  layout: tenant
  requiresAuth: true
</route>

<script setup lang="ts">
import TenantIssuesView from '@/views/TenantIssuesView.vue'
</script>

<template>
  <TenantIssuesView />
</template>
