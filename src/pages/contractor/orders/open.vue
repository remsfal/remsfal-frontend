<route lang="yaml">
name: ContractorOrdersOpen
meta:
  layout: contractor
  requiresAuth: true
</route>

<script setup lang="ts">
import { OrderPlacementRequestsCard, QuotationRequestsCard } from '@/features/contractor/orderManagement';
</script>

<template>
  <OrderPlacementRequestsCard />
  <QuotationRequestsCard />
</template>
