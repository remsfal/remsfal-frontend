<route lang="yaml">
name: ContractorDashboard
meta:
  layout: contractor
  requiresAuth: true
</route>

<script setup lang="ts">
import { OrderManagementDashboardCards } from '@/features/contractor/orderManagement'
import { OrganizationDashboardCards, useOrganizationStore } from '@/features/common/organizations'

const organizationStore = useOrganizationStore()
</script>

<template>
  <OrganizationDashboardCards />
  <OrderManagementDashboardCards v-if="organizationStore.isOrganizationMember" />
</template>
