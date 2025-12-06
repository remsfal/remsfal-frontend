<script setup lang="ts">
import Card from 'primevue/card';
import UserAvatar from '@/components/issue-details/user/UserAvatar.vue';
import TypeBadge from '@/components/issue-details/badges/TypeBadge.vue';
import StatusBadge from '@/components/issue-details/badges/StatusBadge.vue';

defineProps<{
  reporterId: string;
  ownerId: string;
  projectId: string;
  type: string;
  status: string;
  tenancyId?: string;
}>();
</script>

<template>
  <Card class="flex flex-col gap-4 basis-full">
    <template #title>
      <h2 class="font-semibold text-xl">Metadata</h2>
    </template>
    <template #content>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex items-center gap-2">
          <span class="font-medium text-gray-700">Reporter:</span>
          <UserAvatar userId="John Doe" />
          <span>John Doe</span>
        </div>

        <div class="flex items-center gap-2">
          <span class="font-medium text-gray-700">Owner/Assignee:</span>
          <UserAvatar userId="Jane Smith" />
          <span>Jane Smith</span>
        </div>

        <div>
          <span class="font-medium text-gray-700">Project:</span>
          <span class="ml-2">Building A Renovation</span>
        </div>

        <div class="flex items-center gap-2">
          <span class="font-medium text-gray-700">Type:</span>
          <TypeBadge :type="type" />
        </div>

        <div class="flex items-center gap-2">
          <span class="font-medium text-gray-700">Status:</span>
          <StatusBadge :status="status" />
        </div>

        <div v-if="tenancyId">
          <span class="font-medium text-gray-700">Tenancy:</span>
          <span class="ml-2">Apartment 3B - Smith Family</span>
        </div>

        <div>
          <span class="font-medium text-gray-700">Created At:</span>
          <span class="ml-2 text-sm text-gray-500">2025-12-01 10:30:00</span>
        </div>

        <div>
          <span class="font-medium text-gray-700">Last Modified:</span>
          <span class="ml-2 text-sm text-gray-500">2025-12-05 14:22:15</span>
        </div>
      </div>
    </template>
  </Card>
</template>
