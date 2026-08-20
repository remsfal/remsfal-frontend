<route lang="yaml">
name: ApartmentView
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { UnitBreadcrumb, ApartmentDataCard, RentableUnitDangerZoneCard } from '@/features/project/rentableUnits';
import { RentalAgreementListCard } from '@/features/project/rentalAgreements';

const route = useRoute('ApartmentView');
</script>

<template>
  <UnitBreadcrumb
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
  />
  <ApartmentDataCard
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
  />
  <RentalAgreementListCard
    :projectId="(route.params.projectId as string)"
    :rentalUnitId="(route.params.unitId as string)"
    rentalUnitType="APARTMENT"
  />
  <RentableUnitDangerZoneCard
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
    unitType="APARTMENT"
  />
</template>
