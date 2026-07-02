<route lang="yaml">
name: ContractorSettings
meta:
  layout: contractor
  requiresAuth: true
</route>

<script setup lang="ts">
import { UserOrganizationMembershipCard } from '@/features/common/organizations';
</script>

<template>
  <UserOrganizationMembershipCard />
</template>
