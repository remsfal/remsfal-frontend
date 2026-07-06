<script lang="ts" setup>
import { ProjectSettingsCard, BillingAddressCard, ProjectMemberSettingsCard, OrganizationMemberSettingsCard,
  ProjectDangerZoneCard } from '@/features/project/settings';

const props = defineProps<{
  projectId: string;
}>();
</script>

<template>
  <ProjectSettingsCard :projectId="props.projectId" />

  <BillingAddressCard :projectId="props.projectId" />

  <ProjectMemberSettingsCard :projectId="props.projectId" />

  <OrganizationMemberSettingsCard :projectId="props.projectId" />

  <ProjectDangerZoneCard :projectId="props.projectId" />
</template>
