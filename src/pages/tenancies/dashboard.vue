<route lang="yaml">
name: TenantDashboard
meta:
  layout: tenant
  requiresAuth: true
</route>

<script setup lang="ts">
import TenantDashboard from '@/views/tenant/TenantDashboard.vue'
</script>

<template>
  <TenantDashboard />
</template>
