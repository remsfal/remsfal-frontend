<route lang="yaml">
name: ProjectSettings
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import ProjectSettingsView from '@/views/project/ProjectSettingsView.vue'
import { useRoute } from 'vue-router'
const route = useRoute('ProjectSettings')
</script>

<template>
  <ProjectSettingsView :projectId="(route.params.projectId as string)" />
</template>
