<script setup lang="ts">
defineProps<{
  icon: string;
  title: string;
  value: string | number;
  subtext?: string;
  color?: string;
}>();
</script>

<template>
  <div class="shadow rounded-xl p-4 flex items-center gap-4 bg-white">
    <div
      class="rounded-full p-3"
      :class="`bg-${color ?? 'blue'}-100 text-${color ?? 'blue'}-600`"
    >
      <i :class="`pi ${icon} text-xl`" />
    </div>
    <div>
      <p class="text-gray-500 text-sm font-medium">
        {{ title }}
      </p>
      <p class="text-2xl font-bold text-gray-800">
        {{ value }}
      </p>
      <p v-if="subtext" class="text-sm text-gray-500 mt-1">
        {{ subtext }}
      </p>
    </div>
  </div>
</template>
