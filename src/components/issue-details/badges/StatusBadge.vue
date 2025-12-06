<script setup lang="ts">
import Badge from 'primevue/badge';
import { computed } from 'vue';

const props = defineProps<{
  status: string;
}>();

const severity = computed(() => {
  const statusMap: Record<string, string> = {
    PENDING: 'secondary',
    OPEN: 'info',
    IN_PROGRESS: 'warning',
    CLOSED: 'success',
    REJECTED: 'danger',
  };
  return statusMap[props.status] || 'secondary';
});
</script>

<template>
  <Badge :value="status" :severity="severity" />
</template>
