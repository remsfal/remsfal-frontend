<script setup lang="ts">
defineProps<{
  projectId: string
}>()
</script>

<template>
  <main>
  <div class="about">
    <h1>This is an example project {{ projectId }} page</h1>
  </div>
  </main>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
