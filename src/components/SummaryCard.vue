<template>
  <div class="bg-white shadow-md rounded-xl p-4 text-center">
    <h2 class="text-lg font-semibold mb-2">{{ title }}</h2>
    <p class="text-2xl font-bold text-green-600">{{ value }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; value: string | number }>()
</script>
