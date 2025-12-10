<script setup lang="ts">
import Badge from 'primevue/badge';

interface Props {
  role: 'PROPRIETOR' | 'MANAGER' | 'LESSOR' | 'STAFF' | 'COLLABORATOR';
}

defineProps<Props>();

const roleColors = {
  PROPRIETOR: 'danger',
  MANAGER: 'warn',
  LESSOR: 'info',
  STAFF: 'secondary',
  COLLABORATOR: 'contrast'
};
</script>

<template>
  <Badge :value="role" :severity="roleColors[role]" size="small" />
</template>
