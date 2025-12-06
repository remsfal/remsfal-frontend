<script setup lang="ts">
import Avatar from 'primevue/avatar';
import { computed } from 'vue';

const props = defineProps<{
  userId: string;
  size?: 'normal' | 'large' | 'xlarge';
}>();

const initials = computed(() => {
  const names = props.userId.split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  return props.userId.substring(0, 2).toUpperCase();
});

const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const colorIndex = computed(() => {
  let hash = 0;
  for (let i = 0; i < props.userId.length; i++) {
    hash = props.userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % colors.length;
});

const backgroundColor = computed(() => colors[colorIndex.value]);
</script>

<template>
  <Avatar
    :label="initials"
    :size="size"
    shape="circle"
    :style="{ backgroundColor: backgroundColor, color: 'white' }"
  />
</template>
