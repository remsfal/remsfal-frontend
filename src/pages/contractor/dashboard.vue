<route lang="yaml">
name: ContractorDashboard
meta:
  layout: contractor
  requiresAuth: true
</route>

<script setup lang="ts">
import ContractorDashboard from '@/views/contractor/ContractorDashboard.vue'
import { QuotationKpiCards } from '@/features/contractor/orderManagement'
</script>

<template>
  <QuotationKpiCards />
  <ContractorDashboard />
</template>
