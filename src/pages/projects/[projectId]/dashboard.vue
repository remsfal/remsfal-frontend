<route lang="yaml">
name: ProjectDashboard
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import { ref } from 'vue'
import ProjectDashboard from '@/views/project/ProjectDashboard.vue'
import { RentableUnitsKpiCards } from "@/features/project/rentableUnits";
import { RentalAgreementKpiCards } from "@/features/project/rentalAgreements";
import { useRoute } from 'vue-router'
const route = useRoute('ProjectDashboard')
const unitIdsByType = ref<Record<string, string[]>>({})
</script>

<template>
  <RentableUnitsKpiCards
    :projectId="(route.params.projectId as string)"
    @update:unitIdsByType="(idsByType) => (unitIdsByType = idsByType)"
  />
  <RentalAgreementKpiCards
    :projectId="(route.params.projectId as string)"
    :unitIdsByType="unitIdsByType"
  />

  <ProjectDashboard />
</template>
