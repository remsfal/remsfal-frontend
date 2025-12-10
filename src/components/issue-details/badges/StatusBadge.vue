<script setup lang="ts">
import Badge from 'primevue/badge';

interface Props {
  status: 'PENDING' | 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'REJECTED';
}

defineProps<Props>();

const statusColors = {
  PENDING: 'secondary',
  OPEN: 'info',
  IN_PROGRESS: 'warn',
  CLOSED: 'success',
  REJECTED: 'danger'
};
</script>

<template>
  <Badge :value="status" :severity="statusColors[status]" />
</template>
