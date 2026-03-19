<route lang="yaml">
name: ManagerDashboard
meta:
  layout: manager
  requiresAuth: true
</route>

<script setup lang="ts">
import ProjectDashboard from '@/views/project/ProjectDashboard.vue'
</script>

<template>
  <ProjectDashboard />
</template>
