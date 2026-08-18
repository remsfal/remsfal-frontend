<route lang="yaml">
name: ProjectDashboard
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import { computed, ref } from 'vue'
import ProjectDashboard from '@/views/project/ProjectDashboard.vue'
import { RentableUnitsKpiCards, type UnitType } from "@/features/project/rentableUnits";
import { RentalAgreementKpiCards } from "@/features/project/rentalAgreements";
import { useRoute } from 'vue-router'
const route = useRoute('ProjectDashboard')
const unitIdsByType = ref<Partial<Record<UnitType, string[]>>>({})
const hasUnits = computed(() => Object.values(unitIdsByType.value).some((ids) => ids.length > 0))
</script>

<template>
  <RentableUnitsKpiCards
    :projectId="(route.params.projectId as string)"
    @update:unitIdsByType="(idsByType) => (unitIdsByType = idsByType)"
  />
  <RentalAgreementKpiCards
    v-if="hasUnits"
    :projectId="(route.params.projectId as string)"
    :unitIdsByType="unitIdsByType"
  />

  <ProjectDashboard />
</template>
