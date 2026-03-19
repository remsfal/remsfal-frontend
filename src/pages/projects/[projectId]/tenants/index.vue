<route lang="yaml">
name: TenantList
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import TenantListView from '@/views/project/TenantListView.vue'
import { useRoute } from 'vue-router'
const route = useRoute('TenantList')
</script>

<template>
  <TenantListView :projectId="(route.params.projectId as string)" />
</template>
