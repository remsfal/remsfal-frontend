<route lang="yaml">
name: ContractorClientsOpen
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
