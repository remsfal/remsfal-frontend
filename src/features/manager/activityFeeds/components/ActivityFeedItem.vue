<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Tag from 'primevue/tag';
import type { ActivityFeedEntry } from '../stores/ActivityFeedStore';
import { getRelativeTime, getStatusColor, getStatusIcon } from '../composables/useActivityFeedHelpers';
import { useLayout } from '@/layouts/composables/layout';

const props = defineProps<{
  entry: ActivityFeedEntry;
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

const { isDarkTheme } = useLayout();
const { t } = useI18n();

const statusIcon = computed(() => getStatusIcon(props.entry.issueStatus));
const statusColor = computed(() => getStatusColor(props.entry.issueStatus));
const relativeTime = computed(() => getRelativeTime(props.entry.createdAt));
</script>

<template>
  <div
    class="group flex items-start gap-4 px-4 py-4 cursor-pointer transition-all duration-150"
    :class="[
      !isLast ? (isDarkTheme ? 'border-b border-surface-800' : 'border-b border-surface-200') : '',
      entry.read
        ? (isDarkTheme ? 'bg-surface-800/30 hover:bg-surface-800/50' : 'bg-surface-50 hover:bg-surface-100')
        : (isDarkTheme ? 'bg-surface-900 hover:bg-surface-800/50' : 'bg-surface-0 hover:bg-surface-100')
    ]"
    @click="emit('navigate')"
  >
    <!-- Unread Indicator -->
    <div class="w-2.5 flex-shrink-0 flex items-center justify-center self-center">
      <span v-if="!entry.read" class="w-2.5 h-2.5 rounded-full bg-blue-500" />
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
      <div
        class="text-sm mb-0.5"
        :class="isDarkTheme ? 'text-surface-400' : 'text-surface-600'"
      >
        {{ entry.projectName }}
        <span :class="isDarkTheme ? 'text-surface-500' : 'text-surface-400'">#{{ entry.issueId }}</span>
      </div>
      <!-- Title -->
      <div
        class="font-semibold"
        :class="isDarkTheme ? 'text-surface-0' : 'text-surface-900'"
      >
        {{ entry.issueTitle }}
      </div>
    </div>

    <!-- Type Badge  -->
    <div class="w-28 flex-shrink-0 flex justify-start pt-0.5">
      <Tag :value="entry.issueType.toLowerCase()" severity="secondary" rounded class="text-xs" />
    </div>

    <!-- Time  -->
    <div class="w-28 flex-shrink-0 text-left">
      <span
        class="text-sm whitespace-nowrap"
        :class="isDarkTheme ? 'text-surface-500' : 'text-surface-400'"
      >
        {{ relativeTime }}
      </span>
    </div>

    <!-- Hover Actions  -->
    <div class="w-16 flex-shrink-0 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity" @click.stop>
      <Button
        v-if="!entry.read"
        v-tooltip.bottom="t('activityFeeds.actions.markAsRead')"
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
