<script setup lang="ts">
import { ContractorListCard } from '@/features/project/contractors';

defineProps<{ projectId: string }>();
</script>

<template>
  <ContractorListCard :projectId="projectId" />
</template>
