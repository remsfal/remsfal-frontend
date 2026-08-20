<route lang="yaml">
name: SiteView
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { UnitBreadcrumb, SiteDataCard, RentableUnitDangerZoneCard, FacilityAddressCard }
  from '@/features/project/rentableUnits';
import { RentalAgreementListCard } from '@/features/project/rentalAgreements';

const route = useRoute('SiteView');
</script>

<template>
  <UnitBreadcrumb
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
  />
  <SiteDataCard
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
  />
  <RentalAgreementListCard
    :projectId="(route.params.projectId as string)"
    :rentalUnitId="(route.params.unitId as string)"
    rentalUnitType="SITE"
  />
  <FacilityAddressCard
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
    facilityType="SITE"
  />
  <RentableUnitDangerZoneCard
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
    unitType="SITE"
  />
</template>
