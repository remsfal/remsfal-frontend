<route lang="yaml">
name: ProjectContractorDetail
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import ProjectContractorDetailView from '@/views/project/ProjectContractorDetailView.vue'
import { useRoute } from 'vue-router'
const route = useRoute('ProjectContractorDetail')
</script>

<template>
  <ProjectContractorDetailView
    :projectId="(route.params.projectId as string)"
    :contractorId="(route.params.contractorId as string)"
  />
</template>
