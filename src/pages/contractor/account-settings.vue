<route lang="yaml">
name: ContractorAccountSettings
meta:
  layout: contractor
  requiresAuth: true
</route>

<script setup lang="ts">
import AccountSettingsView from '@/views/AccountSettingsView.vue'
</script>

<template>
  <AccountSettingsView />
</template>
