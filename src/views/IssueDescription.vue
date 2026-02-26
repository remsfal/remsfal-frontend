<script setup lang="ts">
  import { ref, watch } from "vue";
  import Textarea from "primevue/textarea";
  
  const props = defineProps<{ description: string }>();
  
  const emit = defineEmits<{ (e: "update:description", value: string): void }>();
  
  const localDescription = ref(props.description);
  
  // Watch for prop changes
  watch(
    () => props.description,
    (newValue) => {
      localDescription.value = newValue;
    }
  );
  
  // Emit changes when localDescription changes
  watch(localDescription, (newValue) => {
    emit("update:description", newValue);
  });
  </script>
  
<template>
  <div class="w-full">
    <Textarea
      v-model="localDescription"
      autoResize
      :rows="8"
      class="w-full"
      placeholder="Write markdown description here..."
    />
  </div>
</template>
  