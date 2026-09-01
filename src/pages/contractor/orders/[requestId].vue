<route lang="yaml">
name: ContractorOrderDetails
meta:
  layout: contractor
  requiresAuth: true
</route>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { QuotationRequestDetailView } from '@/features/contractor/orderManagement';

const route = useRoute('ContractorOrderDetails');
const requestId = computed(() => route.params.requestId as string);
</script>

<template>
  <QuotationRequestDetailView :requestId="requestId" />
</template>
