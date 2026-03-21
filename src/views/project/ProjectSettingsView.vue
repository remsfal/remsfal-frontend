<script lang="ts" setup>
import ProjectSettings from '@/components/ProjectSettings.vue';
import ProjectMemberSettings from '@/components/ProjectMemberSettings.vue';
import ProjectDangerZoneCard from '@/components/ProjectDangerZoneCard.vue';

const props = defineProps<{
  projectId: string;
}>();
</script>

<template>
  <ProjectSettings :projectId="props.projectId" />

  <ProjectMemberSettings :projectId="props.projectId" />

  <ProjectDangerZoneCard :projectId="props.projectId" />
</template>

<style scoped></style>
