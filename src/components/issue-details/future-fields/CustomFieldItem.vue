<script setup lang="ts">
defineProps<{
  fieldName: string;
  fieldValue: string;
}>();
</script>

<template>
  <div class="flex items-start gap-2 text-sm">
    <span class="font-medium text-gray-700 min-w-[180px]">{{ fieldName }}:</span>
    <span class="text-gray-600">{{ fieldValue }}</span>
  </div>
</template>
