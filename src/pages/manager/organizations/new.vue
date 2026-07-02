<route lang="yaml">
name: ManagerOrganizations
meta:
  layout: manager
  requiresAuth: true
</route>

<script setup lang="ts">
import { OrganizationsView } from '@/features/common/organizations';
</script>

<template>
  <OrganizationsView />
</template>
