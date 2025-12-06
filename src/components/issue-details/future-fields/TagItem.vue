<script setup lang="ts">
import Badge from 'primevue/badge';

defineProps<{
  label: string;
}>();

const colors: Record<string, string> = {
  authentication: 'info',
  security: 'danger',
  backend: 'success',
  'high-priority': 'warning',
};

const getColor = (tag: string) => colors[tag] || 'secondary';
</script>

<template>
  <Badge :value="label" :severity="getColor(label)" class="cursor-pointer" />
</template>
