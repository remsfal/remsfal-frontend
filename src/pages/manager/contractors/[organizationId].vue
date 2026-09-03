<route lang="yaml">
name: ManagerContractorDetail
meta:
  layout: manager
  requiresAuth: true
</route>

<script setup lang="ts">
import { ManagerContractorDetailView } from '@/features/manager/contractors';
</script>

<template>
  <ManagerContractorDetailView />
</template>
