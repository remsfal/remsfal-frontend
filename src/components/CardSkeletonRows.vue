<script setup lang="ts">
import Skeleton from 'primevue/skeleton';

interface Props {
  rows?: number;
  rowHeight?: string;
  rowClass?: string;
}

withDefaults(defineProps<Props>(), {
  rows: 3,
  rowHeight: '2.5rem',
  rowClass: 'mb-2',
});
</script>

<template>
  <div class="flex flex-col">
    <Skeleton v-for="i in rows" :key="i" :height="rowHeight" :class="rowClass" />
  </div>
</template>
