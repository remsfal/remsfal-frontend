<route lang="yaml">
name: ProjectDashboard
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import { computed, ref } from 'vue'
import ProjectDashboard from '@/views/ProjectDashboard.vue'
import { RentableUnitsKpiCards, type RentalUnitTreeNodeJson } from "@/features/project/rentableUnits";
import { RentalAgreementKpiCards } from "@/features/project/rentalAgreements";
import { IssueDashboardCards } from "@/features/project/issues";
import { useRoute } from 'vue-router'
const route = useRoute('ProjectDashboard')
const rentableUnitTree = ref<RentalUnitTreeNodeJson[]>([])
const hasUnits = computed(() => rentableUnitTree.value.length > 0)
</script>

<template>
  <RentableUnitsKpiCards
    :projectId="(route.params.projectId as string)"
    @update:rentableUnitTree="(tree) => (rentableUnitTree = tree)"
  />
  <RentalAgreementKpiCards
    v-if="hasUnits"
    :projectId="(route.params.projectId as string)"
    :rentableUnitTree="rentableUnitTree"
  />

  <IssueDashboardCards :projectId="(route.params.projectId as string)" />

  <ProjectDashboard />
</template>
