<route lang="yaml">
name: PropertyView
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { UnitBreadcrumb, PropertyDataCard } from '@/features/project/rentableUnits';
const route = useRoute('PropertyView')
</script>

<template>
  <UnitBreadcrumb
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
    currentTitle=""
    mode="edit"
  />

  <PropertyDataCard
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
  />
</template>
