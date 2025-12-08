<script setup lang="ts">
import Card from 'primevue/card';
import StatusBadge from '@/components/issue-details/badges/StatusBadge.vue';
</script>

<template>
  <Card>
    <template #title>Issue Overview</template>
    <template #content>
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <span class="font-semibold">Issue ID:</span>
          <span class="text-primary">#ISSUE-123</span>
        </div>
        <div class="flex flex-col gap-1">
          <span class="font-semibold">Title:</span>
          <span class="text-xl">Fix login bug on mobile devices</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-semibold">Status:</span>
          <StatusBadge status="OPEN" />
        </div>
      </div>
    </template>
  </Card>
</template>
