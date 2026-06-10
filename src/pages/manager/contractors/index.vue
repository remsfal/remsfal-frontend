<route lang="yaml">
name: ManagerContractorList
meta:
  layout: manager
  requiresAuth: true
</route>

<script setup lang="ts">
import ManagerContractorListView from '@/views/ManagerContractorListView.vue';
</script>

<template>
  <ManagerContractorListView />
</template>
