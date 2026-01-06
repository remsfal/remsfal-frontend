<script setup lang="ts">
import { ref, watch } from "vue";
import Textarea from "primevue/textarea";

interface Props {
  description: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "update:description", value: string): void;
}>();

const localDescription = ref(props.description);

watch(
  () => props.description,
  (newValue) => {
    localDescription.value = newValue;
  }
);

watch(localDescription, (newValue) => {
  emit("update:description", newValue);
});
</script>

<template>
  <div class="w-full">
    <Textarea
      v-model="localDescription"
      :autoResize="true"
      rows="8"
      class="w-full"
      placeholder="Write markdown description here..."
    />
  </div>
</template>
