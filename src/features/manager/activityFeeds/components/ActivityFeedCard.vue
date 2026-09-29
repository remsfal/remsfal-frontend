<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';

import BaseCard from '@/components/BaseCard.vue';
import { useActivityFeedStore } from '../stores/ActivityFeedStore';
import type { ActivityFeedEntry } from '../stores/ActivityFeedStore';
import ActivityFeedToolbar, { type ActivityFeedFilterGroup, type ActivityFeedFilterOption } from './ActivityFeedToolbar.vue';
import ActivityFeedList from './ActivityFeedList.vue';

const { t } = useI18n();
const router = useRouter();
const activityFeed = useActivityFeedStore();

const {
  entries,
  selectedEntries,
  activeTab,
  searchQuery,
  filterProject,
  filterIssueType,
  filterIssueStatus,
  filteredEntries,
  projectOptions,
  grouping,
  isLoading,
  isLoadingMore,
  hasMore,
} = storeToRefs(activityFeed);

const matchesQuery = (entry: ActivityFeedEntry, query: string) =>
  query.split(' ').every(part => {
    const [key, val] = part.split(':');
    if (key === 'status') return entry.issueStatus === val;
    if (key === 'type') return entry.issueType === val;
    if (key === 'project') return entry.projectId === val;
    return true;
  });

const toFilterOption = (id: string, name: string, icon: string, query: string): ActivityFeedFilterOption => ({
  id,
  name,
  icon,
  query,
  count: entries.value.filter(entry => matchesQuery(entry, query)).length,
});

const filterGroups = computed<ActivityFeedFilterGroup[]>(() => {
  const filterData: [string, [string, string, string, string][]][] = [
    ['activityFeeds.filter.smart', [
      ['smart-urgent', 'activityFeeds.filters.smart.urgent', 'pi-exclamation-circle', 'status:OPEN type:DEFECT'],
      ['smart-myTasks', 'activityFeeds.filters.myTasks', 'pi-check-square', 'status:OPEN type:TASK'],
      ['smart-pendingApps', 'activityFeeds.filters.smart.pendingApplications', 'pi-hourglass',
        'status:PENDING type:APPLICATION'],
      ['smart-activeMaintenance', 'activityFeeds.filters.smart.activeMaintenance', 'pi-cog',
        'status:IN_PROGRESS type:MAINTENANCE'],
    ]],
    ['activityFeeds.filter.status', [
      ['status-pending', 'issueStatus.pending', 'pi-clock', 'status:PENDING'],
      ['status-open', 'issueStatus.open', 'pi-circle', 'status:OPEN'],
      ['status-inProgress', 'issueStatus.inProgress', 'pi-sync', 'status:IN_PROGRESS'],
      ['status-closed', 'issueStatus.closed', 'pi-check-circle', 'status:CLOSED'],
      ['status-rejected', 'issueStatus.rejected', 'pi-times-circle', 'status:REJECTED'],
    ]],
    ['activityFeeds.filter.type', [
      ['type-application', 'issueType.application', 'pi-file-edit', 'type:APPLICATION'],
      ['type-task', 'issueType.task', 'pi-list', 'type:TASK'],
      ['type-defect', 'issueType.defect', 'pi-exclamation-triangle', 'type:DEFECT'],
      ['type-maintenance', 'issueType.maintenance', 'pi-wrench', 'type:MAINTENANCE'],
      ['type-termination', 'issueType.termination', 'pi-sign-out', 'type:TERMINATION'],
      ['type-inquiry', 'issueType.inquiry', 'pi-question-circle', 'type:INQUIRY'],
    ]],
  ];
  const groups = filterData.map(([labelKey, items]) => ({
    label: t(labelKey),
    items: items.map(([id, nameKey, icon, query]) => toFilterOption(id, t(nameKey), icon, query)),
  }));

  if (projectOptions.value.length > 0) {
    groups.push({
      label: t('activityFeeds.filter.projects'),
      items: projectOptions.value.map(project =>
        toFilterOption(`project-${project.value}`, project.label, 'pi-building', `project:${project.value}`)),
    });
  }
  return groups;
});

const activeFilterId = ref<string | null>(null);

onMounted(async () => {
  await activityFeed.fetchActivities();
});

const applyFilter = (filterId: string | null) => {
  const filter = filterGroups.value.flatMap(group => group.items).find(option => option.id === filterId);
  activeFilterId.value = filter?.id ?? null;
  filterProject.value = [];
  filterIssueType.value = [];
  filterIssueStatus.value = [];

  filter?.query.split(' ').forEach(part => {
    const [key, val] = part.split(':');
    if (!val) return;
    if (key === 'status') filterIssueStatus.value = [val];
    if (key === 'type') filterIssueType.value = [val];
    if (key === 'project') filterProject.value = [val];
  });
};

const handleActiveTabChange = (value: 'all' | 'unread') => {
  // Ensure a valid tab is always selected
  if (value === 'all' || value === 'unread') {
    activeTab.value = value;
  }
};

const navigateToIssue = async (entry: ActivityFeedEntry) => {
  if (!entry.read) {
    await activityFeed.markAsRead(entry);
  }
  router.push({
    name: 'IssueDetails',
    params: { projectId: entry.projectId, issueId: entry.issueId }
  });
};

const toggleSelection = (entry: ActivityFeedEntry) => {
  const idx = selectedEntries.value.findIndex(e => e.id === entry.id);
  if (idx >= 0) selectedEntries.value.splice(idx, 1);
  else selectedEntries.value.push(entry);
};

const selectAll = () => {
  if (selectedEntries.value.length === displayedEntries.value.length) {
    selectedEntries.value = [];
  } else {
    selectedEntries.value = [...displayedEntries.value];
  }
};

const handleEntrySelect = (entry: ActivityFeedEntry) => {
  toggleSelection(entry);
};

const handleEntryNavigate = (entry: ActivityFeedEntry) => {
  navigateToIssue(entry);
};

const handleEntryMarkRead = (entry: ActivityFeedEntry) => {
  activityFeed.markAsRead(entry);
};

const handleEntryMarkUnread = (entry: ActivityFeedEntry) => {
  activityFeed.markAsUnread(entry);
};

const handleEntryDelete = (entry: ActivityFeedEntry) => {
  selectedEntries.value = [entry];
  activityFeed.confirmDeleteSelected();
};

const displayedEntries = computed(() => {
  return [...filteredEntries.value].sort((a, b) => {
    if (!a.read && b.read) return -1;
    if (a.read && !b.read) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
});
</script>

<template>
  <BaseCard :loading="isLoading" :skeletonRows="6">
    <template #title>
      {{ t('activityFeeds.title') }}
    </template>
    <template #content>
      <div class="flex flex-col min-w-0">
        <ActivityFeedToolbar
          :activeTab="activeTab"
          :searchQuery="searchQuery"
          :selectedCount="selectedEntries.length"
          :filterGroups="filterGroups"
          :activeFilterId="activeFilterId"
          @update:activeTab="handleActiveTabChange"
          @update:searchQuery="searchQuery = $event"
          @update:activeFilterId="applyFilter"
          @markReadSelected="activityFeed.markReadSelected"
          @deleteSelected="activityFeed.confirmDeleteSelected"
        />

        <ActivityFeedList
          :entries="displayedEntries"
          :selectedEntries="selectedEntries"
          :searchQuery="searchQuery"
          :grouping="grouping"
          :hasMore="hasMore"
          :isLoadingMore="isLoadingMore"
          @selectAll="selectAll"
          @selectItem="handleEntrySelect"
          @navigate="handleEntryNavigate"
          @markRead="handleEntryMarkRead"
          @markUnread="handleEntryMarkUnread"
          @delete="handleEntryDelete"
          @loadMore="activityFeed.loadMoreActivities"
        />
      </div>
    </template>
  </BaseCard>
</template>
