<route lang="yaml">
name: SiteView
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { UnitBreadcrumb, SiteDataCard, RentableUnitTenantsCard } from '@/features/project/rentableUnits';
import FacilityAddressCard from '@/components/FacilityAddressCard.vue';

const route = useRoute('SiteView');
</script>

<template>
  <div class="flex flex-col gap-6">
    <UnitBreadcrumb
      :projectId="(route.params.projectId as string)"
      :unitId="(route.params.unitId as string)"
      currentTitle=""
      mode="edit"
    />
    <SiteDataCard
      :projectId="(route.params.projectId as string)"
      :unitId="(route.params.unitId as string)"
    />
    <RentableUnitTenantsCard
      :projectId="(route.params.projectId as string)"
      :unitId="(route.params.unitId as string)"
    />
    <FacilityAddressCard
      :projectId="(route.params.projectId as string)"
      :unitId="(route.params.unitId as string)"
      facilityType="site"
    />
  </div>
</template>
