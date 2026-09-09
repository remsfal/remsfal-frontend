<route lang="yaml">
name: ManagerDashboard
meta:
  layout: manager
  requiresAuth: true
</route>

<script setup lang="ts">
import ProjectDashboard from '@/views/ProjectDashboard.vue'
</script>

<template>
  <ProjectDashboard />
</template>
