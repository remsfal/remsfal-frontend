<route lang="yaml">
name: ContractorView
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
