<template>
  <Card class="shadow-lg rounded-xl">
    <template #content>
      <div class="flex items-center gap-4 p-4">
        <div :class="[bgColor, textColor, 'rounded-full p-3']">
          <i :class="[icon, 'text-xl']"></i>
        </div>
        <div>
          <p class="text-gray-500 text-sm font-medium">{{ label }}</p>
          <p class="text-2xl font-bold text-gray-800">{{ value }}</p>
          <p :class="[infoColor, 'text-sm mt-1']">{{ info }}</p>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import Card from 'primevue/card';

defineProps<{
  icon: string;
  bgColor: string;
  textColor: string;
  label: string;
  value: number | string;
  info: string;
  infoColor: string;
}>();
</script>
