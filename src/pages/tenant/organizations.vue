<route lang="yaml">
name: TenantOrganizations
meta:
  layout: tenant
  requiresAuth: true
</route>

<script setup lang="ts">
import { OrganizationDashboardCards } from '@/features/contractor/organizations';
import { UserOrganizationEmploymentsCard, useOrganizationStore } from '@/features/common/organizations';

const organizationStore = useOrganizationStore();
</script>

<template>
  <OrganizationDashboardCards />
  <UserOrganizationEmploymentsCard v-if="organizationStore.initialized && organizationStore.isOrganizationMember" />
</template>
