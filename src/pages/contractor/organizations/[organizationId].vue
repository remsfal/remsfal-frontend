<route lang="yaml">
name: ContractorOrganizationSettings
meta:
  layout: contractor
  requiresAuth: true
</route>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { OrganizationSettingsView } from '@/features/common/organizations';

const route = useRoute('ContractorOrganizationSettings');
const organizationId = computed(() => route.params.organizationId as string);
</script>

<template>
  <OrganizationSettingsView :organizationId="organizationId" />
</template>
