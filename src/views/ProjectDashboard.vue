<script setup lang="ts">
defineProps<{
  projectId: string;
  title?: string;
}>();
</script>

<template>
  <main>
    <div class="grid">
      <h1>{{ $t('projectDashboard.title', [projectId]) }}</h1>
    </div>
  </main>
</template>
