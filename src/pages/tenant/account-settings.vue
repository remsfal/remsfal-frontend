<route lang="yaml">
name: TenantAccountSettings
meta:
  layout: tenant
  requiresAuth: true
</route>

<script setup lang="ts">
import { AccountSettingsView } from "@/features/common/users";
</script>

<template>
  <AccountSettingsView />
</template>
