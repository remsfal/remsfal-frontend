<script setup lang="ts">
import Card from 'primevue/card';
import StatusBadge from '@/components/issue-details/badges/StatusBadge.vue';

defineProps<{
  issueId: string;
  title: string;
  status: 'PENDING' | 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'REJECTED';
}>();
</script>

<template>
  <Card>
    <template #title>Issue Details</template>
    <template #content>
      <div class="space-y-2">
        <div><strong>Issue ID:</strong> #{{ issueId }}</div>
        <div><strong>Title:</strong> {{ title }}</div>
        <div class="flex items-center gap-2">
          <strong>Status:</strong>
          <StatusBadge :status="status" />
        </div>
      </div>
    </template>
  </Card>
</template>
