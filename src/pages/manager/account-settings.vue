<route lang="yaml">
name: ManagerAccountSettings
meta:
  layout: manager
  requiresAuth: true
</route>

<script setup lang="ts">
import { AccountSettingsView } from '@/features/common/users'
</script>

<template>
  <AccountSettingsView />
</template>
