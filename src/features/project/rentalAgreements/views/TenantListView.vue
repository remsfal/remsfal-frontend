<script setup lang="ts">
import TenantListCard from '../components/TenantListCard.vue';

defineProps<{
  projectId: string;
}>();
</script>

<template>
  <TenantListCard :projectId="projectId" />
</template>
