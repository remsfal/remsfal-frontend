<route lang="yaml">
name: ContractorAccountSettings
meta:
  layout: contractor
  requiresAuth: true
</route>

<script setup lang="ts">
import { AccountSettingsView } from '@/features/common/users'
</script>

<template>
  <AccountSettingsView />
</template>
