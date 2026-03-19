<route lang="yaml">
name: PropertyView
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import PropertyView from '@/views/project/PropertyView.vue'
import { useRoute } from 'vue-router'
const route = useRoute('PropertyView')
</script>

<template>
  <PropertyView
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
  />
</template>
