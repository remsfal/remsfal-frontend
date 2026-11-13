<script setup lang="ts">
import ContractorListCard from '@/features/project/contractors/components/ContractorListCard.vue';

defineProps<{ projectId: string }>();
</script>

<template>
  <ContractorListCard :projectId="projectId" />
</template>
