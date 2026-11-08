<route lang="yaml">
name: ContractorOrdersOngoing
meta:
  layout: contractor
  requiresAuth: true
</route>

<script setup lang="ts">
import { OngoingOrdersCard } from '@/features/contractor/orderManagement';
</script>

<template>
  <OngoingOrdersCard />
</template>
