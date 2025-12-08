<script setup lang="ts">
import Badge from 'primevue/badge';

interface Props {
  type: 'APPLICATION' | 'TASK' | 'DEFECT' | 'MAINTENANCE';
}

defineProps<Props>();

const typeColors = {
  APPLICATION: 'info',
  TASK: 'secondary',
  DEFECT: 'danger',
  MAINTENANCE: 'warn'
};
</script>

<template>
  <Badge :value="type" :severity="typeColors[type]" />
</template>
