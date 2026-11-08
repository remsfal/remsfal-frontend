<route lang="yaml">
name: TenantOrganizations
meta:
  layout: tenant
  requiresAuth: true
</route>

<script setup lang="ts">
import { OrganizationDashboardCards } from '@/features/contractor/organizations';
import { UserOrganizationEmploymentsCard } from '@/features/common/organizations';
import { useOrganizationStore } from '@/stores/OrganizationStore';

const organizationStore = useOrganizationStore();
</script>

<template>
  <OrganizationDashboardCards />
  <UserOrganizationEmploymentsCard v-if="organizationStore.initialized && organizationStore.isOrganizationMember" />
</template>
