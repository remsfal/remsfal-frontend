<script setup lang="ts">
import { ref, watch } from 'vue';
import Textarea from 'primevue/textarea';

interface Props {
  description: string;
}

const props = defineProps<Props>();

const localDescription = ref(props.description);

// Watch for external prop changes
watch(() => props.description, (newValue) => {
  localDescription.value = newValue;
});
</script>

<template>
  <div class="w-full">
    <Textarea
      v-model="localDescription"
      auto-resize
      rows="8"
      class="w-full"
      placeholder="Write markdown description here..."
    />
  </div>
</template>

<style scoped>
/* Component-specific styles if needed */
</style>
