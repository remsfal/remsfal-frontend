<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import DataView from 'primevue/dataview';
import type { ActivityFeedEntry } from '../stores/ActivityFeedStore';
import ActivityFeedItem from './ActivityFeedItem.vue';
import ActivityFeedEmptyState from './ActivityFeedEmptyState.vue';
import { useLayout } from '@/layouts/composables/layout';

const props = defineProps<{
  entries: ActivityFeedEntry[];
  selectedEntries: ActivityFeedEntry[];
  searchQuery: string;
  grouping: 'date' | 'project' | null;
  hasMore: boolean;
  isLoadingMore: boolean;
}>();

const emit = defineEmits<{
  selectAll: [];
  selectItem: [entry: ActivityFeedEntry];
  navigate: [entry: ActivityFeedEntry];
  markRead: [entry: ActivityFeedEntry];
  delete: [entry: ActivityFeedEntry];
  loadMore: [];
}>();

const { isDarkTheme } = useLayout();
const { t, locale } = useI18n();

const isAllSelected = computed(() =>
  props.selectedEntries.length > 0 &&
  props.selectedEntries.length === props.entries.length
);

const isSelected = (entry: ActivityFeedEntry) =>
  props.selectedEntries.some(e => e.id === entry.id);

type GroupedEntries = {
  key: string;
  label: string;
  entries: ActivityFeedEntry[];
}[];

const groupedEntries = computed<GroupedEntries | null>(() => {
  if (!props.grouping || props.entries.length === 0) {
    return null;
  }

  const groups = new Map<string, ActivityFeedEntry[]>();
  const labels = new Map<string, string>();

  props.entries.forEach(entry => {
    let key: string;
    let label: string;

    if (props.grouping === 'date') {
      const date = new Date(entry.createdAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const entryDate = new Date(date);
      entryDate.setHours(0, 0, 0, 0);

      if (entryDate.getTime() === today.getTime()) {
        key = 'today';
        label = t('activityFeeds.grouping.dateLabels.today');
      } else if (entryDate.getTime() === yesterday.getTime()) {
        key = 'yesterday';
        label = t('activityFeeds.grouping.dateLabels.yesterday');
      } else {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        if (entryDate >= weekAgo) {
          key = `week-${entryDate.toISOString().split('T')[0]}`;
          label = entryDate.toLocaleDateString(locale.value, {
            weekday: 'long', day: 'numeric', month: 'long'
          });
        } else {
          key = `month-${entryDate.getFullYear()}-${entryDate.getMonth()}`;
          label = entryDate.toLocaleDateString(locale.value, { month: 'long', year: 'numeric' });
        }
      }
    } else if (props.grouping === 'project') {
      key = entry.projectId;
      label = entry.projectName;
    } else {
      return null;
    }

    if (!groups.has(key)) {
      groups.set(key, []);
      labels.set(key, label);
    }
    groups.get(key)!.push(entry);
  });

  // Sort groups and entries within groups
  const sortedGroups: GroupedEntries = Array.from(groups.entries())
    .map(([key, entries]) => ({
      key,
      label: labels.get(key) || key,
      entries: entries.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    }))
    .sort((a, b) => {
      if (props.grouping === 'date') {
        // Sort by date: today first, then yesterday, then by date descending
        const order = ['today', 'yesterday'];
        const aIdx = order.indexOf(a.key);
        const bIdx = order.indexOf(b.key);
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        return b.key.localeCompare(a.key);
      } else {
        return a.label.localeCompare(b.label);
      }
    });

  return sortedGroups;
});
</script>

<template>
  <div class="flex-1 overflow-y-auto">
    <ActivityFeedEmptyState
      v-if="entries.length === 0"
      :hasSearchQuery="!!searchQuery"
    />

    <template v-else>
      <!-- List Header -->
      <div
        class="flex items-center gap-4 px-4 py-2.5 border-b"
        :class="isDarkTheme ? 'bg-surface-800/50 border-surface-800' : 'bg-surface-50 border-surface-200'"
      >
        <div class="w-2.5 flex-shrink-0" />
        <Checkbox
          :modelValue="isAllSelected"
          binary
          @change="emit('selectAll')"
        />
        <span
          class="text-sm font-medium"
          :class="isDarkTheme ? 'text-surface-400' : 'text-surface-600'"
        >{{ t('activityFeeds.actions.selectAll') }}</span>
      </div>

      <!-- Entry List -->
      <template v-if="!grouping">
        <DataView :value="entries" dataKey="id">
          <template #list="{ items }">
            <div>
              <ActivityFeedItem
                v-for="(entry, index) in items"
                :key="entry.id"
                :entry="entry"
                :isSelected="isSelected(entry)"
                :index="Number(index)"
                :isLast="Number(index) === items.length - 1"
                @select="emit('selectItem', entry)"
                @navigate="emit('navigate', entry)"
                @markRead="emit('markRead', entry)"
                @delete="emit('delete', entry)"
              />
            </div>
          </template>
        </DataView>
      </template>

      <!-- Grouped Entry List -->
      <template v-else-if="groupedEntries">
        <div>
          <template v-for="(group, groupIndex) in groupedEntries" :key="group.key">
            <!-- Group Header -->
            <div
              class="px-4 py-2 border-b sticky top-0 z-10"
              :class="isDarkTheme ? 'bg-surface-800/50 border-surface-700' : 'bg-surface-100 border-surface-200'"
            >
              <span
                class="text-sm font-semibold"
                :class="isDarkTheme ? 'text-surface-300' : 'text-surface-700'"
              >
                {{ group.label }}
                <span class="text-surface-500 ml-2 font-normal">
                  ({{ group.entries.length }})
                </span>
              </span>
            </div>
            <!-- Group Entries -->
            <ActivityFeedItem
              v-for="(entry, index) in group.entries"
              :key="entry.id"
              :entry="entry"
              :isSelected="isSelected(entry)"
              :index="index"
              :isLast="index === group.entries.length - 1 && groupIndex === groupedEntries.length - 1"
              @select="emit('selectItem', entry)"
              @navigate="emit('navigate', entry)"
              @markRead="emit('markRead', entry)"
              @delete="emit('delete', entry)"
            />
          </template>
        </div>
      </template>

      <!-- Load More -->
      <div v-if="hasMore" class="flex justify-center py-4">
        <Button
          :label="t('activityFeeds.actions.loadMore')"
          text
          :loading="isLoadingMore"
          @click="emit('loadMore')"
        />
      </div>
    </template>
  </div>
</template>
