<script setup lang="ts">
import Card from 'primevue/card';

defineProps<{
  issueId: string;
  title: string;
  status: string;
}>();
</script>

<template>
  <Card>
    <template #title>Issue Details</template>
    <template #content>
      <div class="space-y-2">
        <div><strong>Issue ID:</strong> #{{ issueId }}</div>
        <div><strong>Title:</strong> {{ title }}</div>
        <div><strong>Status:</strong> {{ status }}</div>
      </div>
    </template>
  </Card>
</template>
