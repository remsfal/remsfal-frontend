<route lang="yaml">
name: ContractorOrdersClosed
meta:
  layout: contractor
  requiresAuth: true
</route>

<script setup lang="ts">
import { OrderBillingCard } from '@/features/contractor/orderManagement';
</script>

<template>
  <OrderBillingCard />
</template>
