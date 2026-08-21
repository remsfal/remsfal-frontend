<route lang="yaml">
name: CommercialView
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { UnitBreadcrumb, CommercialDataCard, RentableUnitDangerZoneCard } from '@/features/project/rentableUnits';
import { RentalAgreementListCard } from '@/features/project/rentalAgreements';

const route = useRoute('CommercialView');
</script>

<template>
  <UnitBreadcrumb
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
  />
  <CommercialDataCard
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
  />
  <RentalAgreementListCard
    :projectId="(route.params.projectId as string)"
    :rentalUnitId="(route.params.unitId as string)"
    rentalUnitType="COMMERCIAL"
  />
  <RentableUnitDangerZoneCard
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
    unitType="COMMERCIAL"
  />
</template>
