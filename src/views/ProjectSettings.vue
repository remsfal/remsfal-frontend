<script setup lang="ts">
defineProps<{
  projectId: string;
}>();
</script>

<template>
  <main>
    <div class="grid">
      <h1>This is the project settings page for project {{ projectId }}.</h1>
    </div>
  </main>
</template>
