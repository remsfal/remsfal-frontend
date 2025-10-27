<script setup lang="ts">
import { useRoute } from 'vue-router';
const route = useRoute();
const id = route.params.id as string;

</script>

<template>
  <main class="px-6 py-8">
    <h1 class="text-2xl font-semibold mb-4">
      Nachricht {{ id }}
    </h1>
  </main>
</template>