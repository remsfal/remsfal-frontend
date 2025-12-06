<script setup lang="ts">
import Badge from 'primevue/badge';

defineProps<{
  role: string;
}>();
</script>

<template>
  <Badge :value="role" severity="secondary" size="small" />
</template>
