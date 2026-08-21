<script setup lang="ts">
import BaseCard from '@/components/common/BaseCard.vue';
import Skeleton from 'primevue/skeleton';

interface Props {
  icon?: string;
  title?: string;
  value?: string | number;
  subtext?: string;
  iconBackground?: string;
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  icon: undefined,
  title: undefined,
  value: undefined,
  subtext: undefined,
  iconBackground: 'var(--primary-color)',
  loading: false,
});
</script>

<template>
  <BaseCard cardClass="" :loading="loading">
    <template #loading>
      <div class="flex items-center gap-4">
        <Skeleton shape="circle" size="3rem" />
        <div class="flex-1 flex flex-col gap-2">
          <Skeleton width="60%" height="1.25rem" />
          <Skeleton width="40%" height="1.75rem" />
        </div>
      </div>
    </template>
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
