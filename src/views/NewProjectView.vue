<script setup lang="ts">
import { ref } from 'vue';
import NewProjectDialog from '@/components/NewProjectDialog.vue';

const showDialog = ref(true);
</script>

<template>
  <div class="flex items-center justify-center min-h-[80vh] bg-gray-50 px-4">
    <NewProjectDialog v-model:visible="showDialog" />
  </div>
</template>
