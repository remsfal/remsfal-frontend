<route lang="yaml">
name: ContractorOrdersOngoing
meta:
  layout: contractor
  requiresAuth: true
</route>

<script setup lang="ts">
import CustomerView from '@/views/contractor/CustomerView.vue'
</script>

<template>
  <CustomerView />
</template>
