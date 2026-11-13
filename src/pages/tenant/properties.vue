<route lang="yaml">
name: TenantOwnProperties
meta:
  layout: tenant
  requiresAuth: true
</route>

<script setup lang="ts">
import { ProjectSelectionView, ProjectsWelcomeMessage, useProjectStore } from '@/features/common/projects';

const projectStore = useProjectStore();
</script>

<template>
  <ProjectsWelcomeMessage />
  <ProjectSelectionView v-if="projectStore.projectList.length > 0" />
</template>
