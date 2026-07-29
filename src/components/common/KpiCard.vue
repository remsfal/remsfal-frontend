<script setup lang="ts">
import BaseCard from '@/components/common/BaseCard.vue';

interface Props {
  icon: string;
  title: string;
  value: string | number;
  subtext?: string;
  iconBackground?: string;
}

withDefaults(defineProps<Props>(), {
  subtext: undefined,
  iconBackground: 'var(--primary-color)',
});
</script>

<template>
  <BaseCard cardClass="">
    <template #content>
      <div class="flex items-center gap-4">
        <div
          class="rounded-full p-3 flex items-center justify-center text-white"
          :style="{ backgroundColor: iconBackground }"
        >
          <i class="text-xl" :class="[icon]" />
        </div>
        <div>
          <p class="text-gray-800 text-lg font-medium">
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
  </BaseCard>
</template>
