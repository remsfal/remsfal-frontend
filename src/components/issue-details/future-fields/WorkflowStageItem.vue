<script setup lang="ts">
defineProps<{
  current: string;
  progress: number;
  total: number;
  stages: string[];
}>();
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="text-sm">
      <span class="font-medium">Current Stage:</span>
      <span class="ml-2">{{ current }}</span>
    </div>
    <div class="text-sm text-gray-600">
      Progress: {{ progress }} of {{ total }} stages completed
    </div>
    <div class="flex items-center gap-2 mt-2">
      <div
        v-for="(stage, index) in stages"
        :key="index"
        class="flex items-center"
      >
        <div
          :class="[
            'px-3 py-1 rounded text-sm',
            index < progress
              ? 'bg-green-100 text-green-800'
              : index === progress
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-600',
          ]"
        >
          <i
            v-if="index < progress"
            class="pi pi-check text-xs mr-1"
          ></i>
          <i
            v-else-if="index === progress"
            class="pi pi-circle-fill text-xs mr-1"
          ></i>
          {{ stage }}
        </div>
        <i
          v-if="index < stages.length - 1"
          class="pi pi-arrow-right text-gray-400 mx-1"
        ></i>
      </div>
    </div>
  </div>
</template>
