<route lang="yaml">
name: ContractorAccountData
meta:
  layout: contractor
  requiresAuth: true
</route>

<script setup lang="ts">
import { AccountDataView } from '@/features/common/users'
</script>

<template>
  <AccountDataView />
</template>
