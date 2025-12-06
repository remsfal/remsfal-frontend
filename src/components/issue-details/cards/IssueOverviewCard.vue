<script setup lang="ts">
import Card from 'primevue/card';
import StatusBadge from '@/components/issue-details/badges/StatusBadge.vue';

defineProps<{
  id: string;
  title: string;
  status: string;
}>();
</script>

<template>
  <Card class="flex flex-col gap-4 basis-full">
    <template #title>
      <h2 class="font-semibold text-xl">Issue Overview</h2>
    </template>
    <template #content>
      <div class="flex flex-col gap-2">
        <div>
          <span class="font-medium text-gray-700">Issue ID:</span>
          <span class="ml-2">{{ id }}</span>
        </div>
        <div>
          <span class="font-medium text-gray-700">Title:</span>
          <span class="ml-2">{{ title }}</span>
        </div>
        <div>
          <span class="font-medium text-gray-700">Status:</span>
          <StatusBadge :status="status" class="ml-2" />
        </div>
      </div>
    </template>
  </Card>
</template>
