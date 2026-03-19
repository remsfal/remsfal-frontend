<route lang="yaml">
name: ProjectDashboard
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import ProjectDashboard from '@/views/project/ProjectDashboard.vue'
</script>

<template>
  <ProjectDashboard />
</template>
