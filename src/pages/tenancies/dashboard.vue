<route lang="yaml">
name: TenantDashboard
meta:
  layout: tenant
  requiresAuth: true
</route>

<script setup lang="ts">
import TenancieContractList from '@/features/tenant/tenancies/components/TenancieContractList.vue'
</script>

<template>
  <TenancieContractList />
</template>
