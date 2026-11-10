<route lang="yaml">
name: ContractorOwnProperties
meta:
  layout: contractor
  requiresAuth: true
</route>

<script setup lang="ts">
import { ProjectSelectionView, ProjectsWelcomeMessage } from '@/features/manager/projects';
import { useProjectStore } from '@/features/common/projects';

const projectStore = useProjectStore();
</script>

<template>
  <ProjectsWelcomeMessage />
  <ProjectSelectionView v-if="projectStore.projectList.length > 0" />
</template>
