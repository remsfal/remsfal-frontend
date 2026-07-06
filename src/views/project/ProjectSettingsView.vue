<script lang="ts" setup>
import ProjectSettings from '@/components/ProjectSettings.vue';
import BillingAddressCard from '@/components/BillingAddressCard.vue';
import ProjectMemberSettings from '@/components/projectMembership/ProjectMemberSettings.vue';
import OrganizationMemberSettings from '@/components/projectMembership/OrganizationMemberSettings.vue';
import ProjectDangerZoneCard from '@/components/ProjectDangerZoneCard.vue';

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
