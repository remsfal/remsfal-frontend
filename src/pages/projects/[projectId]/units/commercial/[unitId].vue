<route lang="yaml">
name: CommercialView
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import CommercialView from '@/views/project/CommercialView.vue'
import { useRoute } from 'vue-router'
const route = useRoute('CommercialView')
</script>

<template>
  <CommercialView
    :projectId="(route.params.projectId as string)"
    :unitId="(route.params.unitId as string)"
  />
</template>
