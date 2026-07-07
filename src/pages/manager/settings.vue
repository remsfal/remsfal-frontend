<route lang="yaml">
name: ManagerSettings
meta:
  layout: manager
  requiresAuth: true
</route>

<script setup lang="ts">
import { UserOrganizationEmploymentsCard } from '@/features/common/organizations';
</script>

<template>
  <UserOrganizationEmploymentsCard />
</template>
