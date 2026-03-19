<route lang="yaml">
name: ApartmentView
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import ApartmentView from '@/views/project/ApartmentView.vue'
import { useRoute } from 'vue-router'
const route = useRoute('ApartmentView')
</script>

<template>
  <ApartmentView
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
  />
</template>
