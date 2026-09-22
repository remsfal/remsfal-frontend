<route lang="yaml">
name: ManagerDashboard
meta:
  layout: manager
  requiresAuth: true
</route>

<script setup lang="ts">
import { ProjectDashboardView } from '@/features/project/dashboard'
import { ProjectsWelcomeMessage } from '@/features/manager/projects'
</script>

<template>
  <ProjectsWelcomeMessage />
  <ProjectDashboardView />
</template>
