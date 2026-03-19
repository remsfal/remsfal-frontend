<route lang="yaml">
name: BuildingView
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import BuildingView from '@/views/project/BuildingView.vue'
import { useRoute } from 'vue-router'
const route = useRoute('BuildingView')
</script>

<template>
  <BuildingView
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
  />
</template>
