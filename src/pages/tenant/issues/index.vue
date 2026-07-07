<route lang="yaml">
name: TenantIssues
meta:
  layout: tenant
  requiresAuth: true
</route>

<script setup lang="ts">
import { TenantIssueList } from '@/features/tenant/tenantIssues'
</script>

<template>
  <TenantIssueList />
</template>
