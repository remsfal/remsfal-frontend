<route lang="yaml">
name: CommercialView
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import UnitBreadcrumb from '@/components/UnitBreadcrumb.vue';
import CommercialDataCard from '@/components/commercial/CommercialDataCard.vue';

const route = useRoute('CommercialView');
</script>

<template>
  <div class="flex flex-col gap-6">
    <UnitBreadcrumb
      :projectId="(route.params.projectId as string)"
      :unitId="(route.params.unitId as string)"
      currentTitle=""
      mode="edit"
    />
    <CommercialDataCard
      :projectId="(route.params.projectId as string)"
      :unitId="(route.params.unitId as string)"
    />
  </div>
</template>
