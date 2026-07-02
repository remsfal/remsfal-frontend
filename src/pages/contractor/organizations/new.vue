<route lang="yaml">
name: ContractorOrganizations
meta:
  layout: contractor
  requiresAuth: true
</route>

<script setup lang="ts">
import { OrganizationsView } from '@/features/common/organizations';
</script>

<template>
  <OrganizationsView />
</template>
