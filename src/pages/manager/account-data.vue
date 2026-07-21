<route lang="yaml">
name: ManagerAccountData
meta:
  layout: manager
  requiresAuth: true
</route>

<script setup lang="ts">
import { AccountDataView } from '@/features/common/users'
</script>

<template>
  <AccountDataView />
</template>
