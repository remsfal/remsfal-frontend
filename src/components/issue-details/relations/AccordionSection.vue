<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';

defineProps<{
  title: string;
  note?: string;
}>();

const isExpanded = ref(false);
</script>

<template>
  <div class="border rounded-lg">
    <div
      class="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
      @click="isExpanded = !isExpanded"
    >
      <div>
        <h4 class="font-medium">{{ title }}</h4>
        <p v-if="note" class="text-sm text-gray-500 italic">{{ note }}</p>
      </div>
      <Button
        :icon="isExpanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
        text
        rounded
      />
    </div>
    <div v-if="isExpanded" class="p-3 pt-0 border-t">
      <slot></slot>
    </div>
  </div>
</template>
