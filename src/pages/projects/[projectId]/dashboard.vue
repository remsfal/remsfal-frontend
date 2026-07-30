<route lang="yaml">
name: ProjectDashboard
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import ProjectDashboard from '@/views/project/ProjectDashboard.vue'
import { RentableUnitsKpiCards } from "@/features/project/rentableUnits";
import { useRoute } from 'vue-router'
const route = useRoute('ProjectDashboard')
</script>

<template>
  <RentableUnitsKpiCards :projectId="(route.params.projectId as string)" />

  <ProjectDashboard />
</template>
