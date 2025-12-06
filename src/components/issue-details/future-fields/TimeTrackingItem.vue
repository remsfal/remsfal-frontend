<script setup lang="ts">
import UserAvatar from '@/components/issue-details/user/UserAvatar.vue';

defineProps<{
  user: string;
  hours: number;
  description: string;
}>();
</script>

<template>
  <div class="flex items-center gap-3 p-2">
    <UserAvatar :userId="user" size="normal" />
    <div class="flex-1">
      <div class="flex items-center gap-2">
        <span class="font-medium text-sm">{{ user }}</span>
        <span class="text-sm text-gray-600">• {{ hours }} hours</span>
      </div>
      <p class="text-sm text-gray-500">{{ description }}</p>
    </div>
  </div>
</template>
