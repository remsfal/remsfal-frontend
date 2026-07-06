<script lang="ts" setup>
import { ProjectSettings, BillingAddressCard, ProjectMemberSettings } from '@/features/project/settings';
import { OrganizationMemberSettings, ProjectDangerZoneCard } from '@/features/project/settings';

const props = defineProps<{
  projectId: string;
}>();
</script>

<template>
  <ProjectSettings :projectId="props.projectId" />

  <BillingAddressCard :projectId="props.projectId" />

  <ProjectMemberSettings :projectId="props.projectId" />

  <OrganizationMemberSettings :projectId="props.projectId" />

  <ProjectDangerZoneCard :projectId="props.projectId" />
</template>
