<script setup lang="ts">
import { ref } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';

defineProps<{
  description: string;
}>();

const isEditing = ref(false);
</script>

<template>
  <Card class="flex flex-col gap-4 basis-full">
    <template #title>
      <div class="flex justify-between items-center">
        <h2 class="font-semibold text-xl">Description</h2>
        <Button
          icon="pi pi-pencil"
          text
          rounded
          @click="isEditing = !isEditing"
        />
      </div>
    </template>
    <template #content>
      <div v-if="!isEditing" class="prose max-w-none">
        <!-- Markdown preview area - placeholder -->
        <div v-html="description" class="whitespace-pre-wrap"></div>
      </div>
      <div v-else>
        <!-- Edit mode placeholder -->
        <textarea
          :value="description"
          class="w-full min-h-[200px] p-2 border rounded"
          placeholder="Edit description (markdown supported)..."
        ></textarea>
      </div>
    </template>
  </Card>
</template>
