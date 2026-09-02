<route lang="yaml">
name: ContractorDashboard
meta:
  layout: contractor
  requiresAuth: true
</route>

<script setup lang="ts">
import { OrderManagementDashboardCards } from '@/features/contractor/orderManagement'
import { OrganizationDashboardCards } from '@/features/contractor/organizations'
import { useOrganizationStore } from '@/stores/OrganizationStore'

const organizationStore = useOrganizationStore()
</script>

<template>
  <OrganizationDashboardCards />
  <OrderManagementDashboardCards v-if="organizationStore.userEmployments.length > 0" />
</template>
