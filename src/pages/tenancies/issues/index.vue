<route lang="yaml">
name: TenantIssues
meta:
  layout: tenant
  requiresAuth: true
</route>

<script setup lang="ts">
import { TenantIssues } from '@/features/tenant/tenantIssues'
</script>

<template>
  <TenantIssues />
</template>
