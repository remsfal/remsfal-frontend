<route lang="yaml">
name: TenantDashboard
meta:
  layout: tenant
  requiresAuth: true
</route>

<script setup lang="ts">
import { TenancieContractList } from '@/features/tenant/tenancies'
</script>

<template>
  <TenancieContractList />
</template>
