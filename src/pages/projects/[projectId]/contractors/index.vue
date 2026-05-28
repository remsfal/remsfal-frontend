<route lang="yaml">
name: ProjectContractorList
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import ProjectContractorListView from '@/views/project/ProjectContractorListView.vue'
import { useRoute } from 'vue-router'
const route = useRoute('ProjectContractorList')
</script>

<template>
  <ProjectContractorListView :projectId="(route.params.projectId as string)" />
</template>
