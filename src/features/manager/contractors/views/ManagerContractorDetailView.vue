<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ManagerContractorInfoCard } from '@/features/manager/contractors';

const route = useRoute('ManagerContractorDetail');
const organizationId = route.params.organizationId as string;
</script>

<template>
  <ManagerContractorInfoCard :organizationId="organizationId" />
</template>
