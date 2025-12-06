<script setup lang="ts">
import UserAvatar from '@/components/issue-details/user/UserAvatar.vue';
import MemberRoleBadge from '@/components/issue-details/badges/MemberRoleBadge.vue';

defineProps<{
  icon: string;
  user: string;
  role: string;
  action: string;
  timestamp: string;
}>();
</script>

<template>
  <div class="flex gap-3 p-3">
    <div class="flex-shrink-0">
      <i :class="`pi ${icon} text-orange-500`"></i>
    </div>
    <div class="flex-1">
      <div class="flex items-center gap-2">
        <UserAvatar :userId="user" size="normal" />
        <span class="font-medium">{{ user }}</span>
        <MemberRoleBadge :role="role" />
      </div>
      <p class="text-gray-700 mt-1">{{ action }}</p>
      <span class="text-sm text-gray-500">{{ timestamp }}</span>
    </div>
  </div>
</template>
