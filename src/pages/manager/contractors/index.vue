<route lang="yaml">
name: ManagerContractorList
meta:
  layout: manager
  requiresAuth: true
</route>

<script setup lang="ts">
import { ManagerContractorListView } from '@/features/manager/contractors';
</script>

<template>
  <ManagerContractorListView />
</template>
