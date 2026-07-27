<route lang="yaml">
name: ProjectSelection
meta:
  layout: manager
  requiresAuth: true
</route>

<script setup lang="ts">
import { ProjectSelectionView } from '@/features/manager/projects';
</script>

<template>
  <ProjectSelectionView />
</template>
