<route lang="yaml">
name: RentableUnits
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import { RentableUnitsCard } from '@/features/project/rentableUnits'
import { useRoute } from 'vue-router'
const route = useRoute('RentableUnits')
</script>

<template>
  <RentableUnitsCard :projectId="(route.params.projectId as string)" />
</template>
