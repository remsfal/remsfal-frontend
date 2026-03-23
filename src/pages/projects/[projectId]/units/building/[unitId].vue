<route lang="yaml">
name: BuildingView
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { UnitBreadcrumb, BuildingDataCard } from '@/features/project/rentableUnits';
import FacilityAddressCard from '@/components/FacilityAddressCard.vue';

const route = useRoute('BuildingView');
</script>

<template>
  <UnitBreadcrumb
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
    currentTitle=""
    mode="edit"
  />

  <BuildingDataCard
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
  />

  <FacilityAddressCard
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
    facilityType="building"
  />
</template>
