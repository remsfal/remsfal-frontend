<route lang="yaml">
name: ContractorOrdersOpen
meta:
  layout: contractor
  requiresAuth: true
</route>

<script setup lang="ts">
import ContractorClientsView from '@/views/contractor/ContractorClientsView.vue'
</script>

<template>
  <ContractorClientsView />
</template>
