<route lang="yaml">
name: ApartmentView
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import UnitBreadcrumb from '@/components/UnitBreadcrumb.vue';
import ApartmentDataCard from '@/components/apartment/ApartmentDataCard.vue';

const route = useRoute('ApartmentView');
</script>

<template>
  <div class="flex flex-col gap-6">
    <UnitBreadcrumb
      :projectId="(route.params.projectId as string)"
      :unitId="(route.params.unitId as string)"
      currentTitle=""
      mode="edit"
    />
    <ApartmentDataCard
      :projectId="(route.params.projectId as string)"
      :unitId="(route.params.unitId as string)"
    />
  </div>
</template>
