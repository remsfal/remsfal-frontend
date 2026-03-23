<route lang="yaml">
name: ApartmentView
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { UnitBreadcrumb, ApartmentDataCard, RentableUnitDangerZoneCard } from '@/features/project/rentableUnits';

const route = useRoute('ApartmentView');
</script>

<template>
  <UnitBreadcrumb
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
    currentTitle=""
    mode="edit"
  />
  <ApartmentDataCard
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
  />
  <RentableUnitDangerZoneCard
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
    unitType="APARTMENT"
  />
</template>
