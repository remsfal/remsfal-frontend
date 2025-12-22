<script setup lang="ts">
import Card from 'primevue/card';

defineProps<{
  description: string;
}>();
</script>

<template>
  <Card>
    <template #title>Description</template>
    <template #content>
      <div>
        <p>{{ description }}</p>
      </div>
    </template>
  </Card>
</template>
  