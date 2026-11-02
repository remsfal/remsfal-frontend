<route lang="yaml">
name: ContractorClientList
meta:
  layout: contractor
  requiresAuth: true
</route>

<script setup lang="ts">
import { ContractorClientListView } from '@/features/contractor/customers';
</script>

<template>
  <ContractorClientListView />
</template>
