<route lang="yaml">
name: ContractorOrdersClosed
meta:
  layout: contractor
  requiresAuth: true
</route>

<script setup lang="ts">
import { OrderPlacementRequestsCard, QuotationRequestsCard } from '@/features/contractor/orderManagement';
</script>

<template>
  <div class="flex flex-col gap-4">
    <OrderPlacementRequestsCard />
    <QuotationRequestsCard />
  </div>
</template>
