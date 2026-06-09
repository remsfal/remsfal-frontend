<route lang="yaml">
path: /tenancies/issues/:issueId
name: TenantIssueDetails
meta:
  layout: tenant
  requiresAuth: true
</route>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { TenantIssueDetails } from '@/features/tenant/tenantIssues';

const route = useRoute();
const issueId = computed(() => String(route.params.issueId || ''));
</script>

<template>
  <TenantIssueDetails :issueId="issueId" />
</template>