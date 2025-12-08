<script setup lang="ts">
import Card from 'primevue/card';
import UserAvatar from '@/components/issue-details/user/UserAvatar.vue';
import StatusBadge from '@/components/issue-details/badges/StatusBadge.vue';
import TypeBadge from '@/components/issue-details/badges/TypeBadge.vue';
</script>

<template>
  <Card>
    <template #title>Metadata</template>
    <template #content>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Reporter -->
        <div class="flex items-center gap-3">
          <span class="font-semibold min-w-[120px]">Reporter:</span>
          <div class="flex items-center gap-2">
            <UserAvatar name="John Doe" color="bg-blue-500" />
            <span>John Doe</span>
          </div>
        </div>

        <!-- Owner/Assignee -->
        <div class="flex items-center gap-3">
          <span class="font-semibold min-w-[120px]">Owner/Assignee:</span>
          <div class="flex items-center gap-2">
            <UserAvatar name="Jane Smith" color="bg-purple-500" />
            <span>Jane Smith</span>
          </div>
        </div>

        <!-- Project -->
        <div class="flex items-center gap-3">
          <span class="font-semibold min-w-[120px]">Project:</span>
          <span class="text-primary cursor-pointer hover:underline">Building A Renovation</span>
        </div>

        <!-- Issue Type -->
        <div class="flex items-center gap-3">
          <span class="font-semibold min-w-[120px]">Type:</span>
          <TypeBadge type="TASK" />
        </div>

        <!-- Status -->
        <div class="flex items-center gap-3">
          <span class="font-semibold min-w-[120px]">Status:</span>
          <StatusBadge status="IN_PROGRESS" />
        </div>

        <!-- Tenancy -->
        <div class="flex items-center gap-3">
          <span class="font-semibold min-w-[120px]">Tenancy:</span>
          <span>Apartment 3B</span>
        </div>

        <!-- Created At -->
        <div class="flex items-center gap-3">
          <span class="font-semibold min-w-[120px]">Created:</span>
          <span>2024-12-01 10:30 AM</span>
        </div>

        <!-- Last Modified -->
        <div class="flex items-center gap-3">
          <span class="font-semibold min-w-[120px]">Last Modified:</span>
          <span>2024-12-08 09:15 AM</span>
        </div>
      </div>
    </template>
  </Card>
</template>
