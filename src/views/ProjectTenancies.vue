<script setup lang="ts">
defineProps<{
  projectId: string;
}>();
</script>

<template>
  <main>
    <div class="grid">
      <h1>{{ $t('projectTenancies.title', [projectId]) }}</h1>
    </div>
  </main>
</template>
