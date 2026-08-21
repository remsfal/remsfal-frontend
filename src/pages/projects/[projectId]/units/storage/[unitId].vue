<route lang="yaml">
name: StorageView
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { UnitBreadcrumb, StorageDataCard, RentableUnitDangerZoneCard } from '@/features/project/rentableUnits';
import { RentalAgreementListCard } from '@/features/project/rentalAgreements';

const route = useRoute('StorageView');
</script>

<template>
  <UnitBreadcrumb
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
  />
  <StorageDataCard
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
  />
  <RentalAgreementListCard
    :projectId="(route.params.projectId as string)"
    :rentalUnitId="(route.params.unitId as string)"
    rentalUnitType="STORAGE"
  />
  <RentableUnitDangerZoneCard
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
    unitType="STORAGE"
  />
</template>
