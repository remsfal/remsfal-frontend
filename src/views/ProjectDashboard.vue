<script setup lang="ts">
defineProps<{
  projectId: string;
  title?: string;
}>();
</script>

<template>
  <main>
    <div class="grid">
      <h1>This is the project dashboard page for project {{ projectId }}.</h1>
    </div>
  </main>
</template>
