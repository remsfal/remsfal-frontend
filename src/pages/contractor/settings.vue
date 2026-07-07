<route lang="yaml">
name: ContractorSettings
meta:
  layout: contractor
  requiresAuth: true
</route>

<script setup lang="ts">
import { UserOrganizationEmploymentsCard } from '@/features/common/organizations';
</script>

<template>
  <UserOrganizationEmploymentsCard />
</template>
