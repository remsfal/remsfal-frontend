<script setup lang="ts">
import Badge from 'primevue/badge';
import { computed } from 'vue';

const props = defineProps<{
  type: string;
}>();

const severity = computed(() => {
  const typeMap: Record<string, string> = {
    APPLICATION: 'contrast',
    TASK: 'info',
    DEFECT: 'danger',
    MAINTENANCE: 'warning',
  };
  return typeMap[props.type] || 'secondary';
});
</script>

<template>
  <Badge :value="type" :severity="severity" />
</template>
