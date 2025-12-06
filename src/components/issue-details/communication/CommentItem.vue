<script setup lang="ts">
import UserAvatar from '@/components/issue-details/user/UserAvatar.vue';
import MemberRoleBadge from '@/components/issue-details/badges/MemberRoleBadge.vue';

defineProps<{
  user: string;
  role: string;
  timestamp: string;
  message: string;
}>();
</script>

<template>
  <div class="flex gap-3 p-3 border rounded-lg">
    <UserAvatar :userId="user" />
    <div class="flex-1">
      <div class="flex items-center gap-2 mb-1">
        <span class="font-medium text-gray-900">{{ user }}</span>
        <MemberRoleBadge :role="role" />
        <span class="text-sm text-gray-500 ml-auto">{{ timestamp }}</span>
      </div>
      <p class="text-gray-700">{{ message }}</p>
    </div>
  </div>
</template>
