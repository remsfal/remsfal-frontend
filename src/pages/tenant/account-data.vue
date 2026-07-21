<route lang="yaml">
name: TenantAccountData
meta:
  layout: tenant
  requiresAuth: true
</route>

<script setup lang="ts">
import { AccountDataView } from "@/features/common/users";
</script>

<template>
  <AccountDataView />
</template>
