<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Tag from 'primevue/tag';
import type { InboxMessage } from '@/services/InboxService';
import { getRelativeTime, getStatusColor, getStatusIcon } from './composables/useInboxHelpers';

const props = defineProps<{
  message: InboxMessage;
  isSelected: boolean;
  index: number;
  isLast: boolean;
}>();

const emit = defineEmits<{
  select: [];
  navigate: [];
  markRead: [];
  delete: [];
}>();

const { t } = useI18n();

const statusIcon = computed(() => getStatusIcon(props.message.issueStatus));
const statusColor = computed(() => getStatusColor(props.message.issueStatus));
const relativeTime = computed(() => getRelativeTime(props.message.receivedAt));
</script>

<template>
  <div 
    class="group flex items-start gap-4 px-4 py-4 hover:bg-surface-100 
      dark:hover:bg-surface-800/50 cursor-pointer transition-all duration-150"
    :class="[
      { 'border-b border-[#d1d5db] dark:border-surface-800': !isLast },
      message.isRead ? 'bg-[#f7f8fa] dark:bg-surface-800/30' : 'bg-white dark:bg-surface-900'
    ]"
    @click="emit('navigate')"
  >
    <!-- Unread Indicator -->
    <div class="w-2.5 flex-shrink-0 flex items-center justify-center self-center">
      <span v-if="!message.isRead" class="w-2.5 h-2.5 rounded-full bg-blue-500" />
    </div>

    <!-- Checkbox -->
    <div class="self-center" @click.stop>
      <Checkbox :modelValue="isSelected" binary @change="emit('select')" />
    </div>

    <!-- Status Icon -->
    <i class="text-lg self-center" :class="[statusIcon, statusColor]" />

    <!-- Content Block -->
    <div class="flex-1 min-w-0">
      <!-- Project + Issue ID -->
      <div class="text-sm text-surface-600 dark:text-surface-400 mb-0.5">
        {{ message.projectName }} 
        <span class="text-surface-400 dark:text-surface-500">#{{ message.issueId }}</span>
      </div>
      <!-- Title -->
      <div class="font-semibold text-surface-900 dark:text-surface-0">
        {{ message.issueTitle }}
      </div>
    </div>

    <!-- Type Badge  -->
    <div class="w-28 flex-shrink-0 flex justify-start pt-0.5">
      <Tag :value="message.issueType.toLowerCase()" severity="secondary" rounded class="text-xs" />
    </div>

    <!-- Time  -->
    <div class="w-28 flex-shrink-0 text-left">
      <span class="text-sm text-surface-400 dark:text-surface-500 whitespace-nowrap">
        {{ relativeTime }}
      </span>
    </div>

    <!-- Hover Actions  -->
    <div class="w-16 flex-shrink-0 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity" @click.stop>
      <Button 
        v-if="!message.isRead" 
        v-tooltip.bottom="t('inbox.actions.markAsDone')" 
        icon="pi pi-check" 
        text 
        rounded 
        size="small" 
        @click="emit('markRead')"
      />
      <Button 
        v-tooltip.bottom="t('button.delete')" 
        icon="pi pi-trash" 
        text 
        rounded 
        severity="danger" 
        size="small" 
        @click="emit('delete')"
      />
    </div>
  </div>
</template>

