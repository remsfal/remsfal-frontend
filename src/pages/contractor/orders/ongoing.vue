<route lang="yaml">
name: ContractorOrdersOngoing
meta:
  layout: contractor
  requiresAuth: true
</route>

<script setup lang="ts">
import { CustomerView } from '@/features/contractor/customers'
</script>

<template>
  <CustomerView />
</template>
