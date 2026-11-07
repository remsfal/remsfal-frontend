<route lang="yaml">
name: ProjectSelection
meta:
  layout: manager
  requiresAuth: true
</route>

<script setup lang="ts">
import { ProjectSelectionView, ProjectsWelcomeMessage } from '@/features/manager/projects';
</script>

<template>
  <ProjectsWelcomeMessage />
  <ProjectSelectionView />
</template>
