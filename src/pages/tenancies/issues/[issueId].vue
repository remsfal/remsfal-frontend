<route lang="yaml">
name: TenantIssueDetails
meta:
  layout: tenant
  requiresAuth: true
</route>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { TenantIssueDetails } from '@/features/project/tenant/tenantIssues';

const route = useRoute('TenantIssueDetails');
</script>

<template>
  <TenantIssueDetails :issueId="(route.params.issueId as string)" />
</template>
