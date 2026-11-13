<script lang="ts" setup>
import ProjectSettingsCard from '@/features/project/settings/components/ProjectSettingsCard.vue';
import BillingAddressCard from '@/features/project/settings/components/BillingAddressCard.vue';
import ProjectMemberSettingsCard from '@/features/project/settings/components/ProjectMemberSettingsCard.vue';
import OrganizationMemberSettingsCard from '@/features/project/settings/components/OrganizationMemberSettingsCard.vue';
import ProjectDangerZoneCard from '@/features/project/settings/components/ProjectDangerZoneCard.vue';

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
