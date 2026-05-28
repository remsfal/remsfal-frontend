<route lang="yaml">
name: TenantDetail
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import TenantDetailView from '@/views/project/TenantDetailView.vue'
import { useRoute } from 'vue-router'
const route = useRoute('TenantDetail')
</script>

<template>
  <TenantDetailView
    :projectId="(route.params.projectId as string)"
    :tenantId="(route.params.tenantId as string)"
  />
</template>
