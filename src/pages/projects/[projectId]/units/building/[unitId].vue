<route lang="yaml">
name: BuildingView
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { UnitBreadcrumb, BuildingDataCard, RentableUnitDangerZoneCard, FacilityAddressCard }
  from '@/features/project/rentableUnits';
import { RentalAgreementListCard } from '@/features/project/rentalAgreements';

const route = useRoute('BuildingView');
</script>

<template>
  <UnitBreadcrumb
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
  />

  <BuildingDataCard
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
  />

  <FacilityAddressCard
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
    facilityType="BUILDING"
  />

  <RentalAgreementListCard
    :projectId="(route.params.projectId as string)"
    :rentalUnitId="(route.params.unitId as string)"
    rentalUnitType="BUILDING"
  />

  <RentableUnitDangerZoneCard
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
    unitType="BUILDING"
  />
</template>
