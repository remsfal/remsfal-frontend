<script setup lang="ts">
import StatusBadge from '@/components/issue-details/badges/StatusBadge.vue';
import Button from 'primevue/button';

defineProps<{
  issueId: string;
  title: string;
  status: string;
  showActions?: boolean;
}>();
</script>

<template>
  <div class="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
    <div class="flex-1">
      <a href="#" class="text-blue-600 hover:underline font-medium">
        #{{ issueId }}: {{ title }}
      </a>
      <StatusBadge :status="status" class="ml-2" />
    </div>
    <div v-if="showActions" class="flex gap-1">
      <Button icon="pi pi-pencil" text size="small" title="Change" />
      <Button icon="pi pi-times" text size="small" severity="danger" title="Remove" />
    </div>
  </div>
</template>
