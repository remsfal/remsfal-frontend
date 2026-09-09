<route lang="yaml">
name: ContractorOrderDetails
meta:
  layout: contractor
  requiresAuth: true
</route>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { OrderManagementDetailsView } from '@/features/contractor/orderManagement';

const route = useRoute('ContractorOrderDetails');
const issueId = computed(() => route.params.issueId as string);
</script>

<template>
  <OrderManagementDetailsView :issueId="issueId" />
</template>
