<route lang="yaml">
name: StorageView
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import UnitBreadcrumb from '@/components/UnitBreadcrumb.vue';
import StorageDataCard from '@/components/storage/StorageDataCard.vue';

const route = useRoute('StorageView');
</script>

<template>
  <div class="flex flex-col gap-6">
    <UnitBreadcrumb
      :projectId="(route.params.projectId as string)"
      :unitId="(route.params.unitId as string)"
      currentTitle=""
      mode="edit"
    />
    <StorageDataCard
      :projectId="(route.params.projectId as string)"
      :unitId="(route.params.unitId as string)"
    />
  </div>
</template>
