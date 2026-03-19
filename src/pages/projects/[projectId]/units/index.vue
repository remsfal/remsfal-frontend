<route lang="yaml">
name: RentableUnits
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import RentableUnitsView from '@/views/project/RentableUnitsView.vue'
import { useRoute } from 'vue-router'
const route = useRoute('RentableUnits')
</script>

<template>
  <RentableUnitsView :projectId="(route.params.projectId as string)" />
</template>
