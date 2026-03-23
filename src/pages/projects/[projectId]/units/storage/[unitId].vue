<route lang="yaml">
name: StorageView
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { UnitBreadcrumb, StorageDataCard, RentableUnitDangerZoneCard } from '@/features/project/rentableUnits';

const route = useRoute('StorageView');
</script>

<template>
  <UnitBreadcrumb
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
    currentTitle=""
    mode="edit"
  />
  <StorageDataCard
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
  />
  <RentableUnitDangerZoneCard
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
    unitType="STORAGE"
  />
</template>
