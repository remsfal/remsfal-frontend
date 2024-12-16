<template>
  <div>
    <h1>Edit Task</h1>
    <p>Task ID: {{ taskId }}</p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
const taskId = route.params.taskid as string; // Ensure correct typing
</script>
