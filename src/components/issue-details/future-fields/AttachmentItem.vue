<script setup lang="ts">
import Button from 'primevue/button';

defineProps<{
  name: string;
  size: string;
  date: string;
}>();
</script>

<template>
  <div class="flex items-center justify-between p-2 hover:bg-gray-100 rounded">
    <div class="flex items-center gap-2">
      <i class="pi pi-file text-gray-400"></i>
      <div>
        <div class="font-medium text-sm">{{ name }}</div>
        <div class="text-xs text-gray-500">{{ size }} • Uploaded {{ date }}</div>
      </div>
    </div>
    <div class="flex gap-1">
      <Button icon="pi pi-download" text size="small" title="Download" />
      <Button icon="pi pi-times" text size="small" severity="danger" title="Remove" />
    </div>
  </div>
</template>
