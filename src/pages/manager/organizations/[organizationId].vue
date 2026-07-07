<route lang="yaml">
name: ManagerOrganizationSettings
meta:
  layout: manager
  requiresAuth: true
</route>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { OrganizationSettingsView } from '@/features/common/organizations';

const route = useRoute('ManagerOrganizationSettings');
const organizationId = computed(() => route.params.organizationId as string);
</script>

<template>
  <OrganizationSettingsView :organizationId="organizationId" />
</template>
