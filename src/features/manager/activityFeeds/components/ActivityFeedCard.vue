<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';

import BaseCard from '@/components/BaseCard.vue';
import { useActivityFeedStore } from '../stores/ActivityFeedStore';
import type { ActivityFeedEntry } from '../stores/ActivityFeedStore';
import ActivityFeedSidebar, { type CustomFilter } from './ActivityFeedSidebar.vue';
import ActivityFeedToolbar from './ActivityFeedToolbar.vue';
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

const customFilters = computed<CustomFilter[]>(() => {
  const filterData = [
    ['smart-urgent', 'activityFeeds.filters.smart.urgent', 'pi-exclamation-circle', 'status:OPEN type:DEFECT'],
    ['smart-myTasks', 'activityFeeds.filters.myTasks', 'pi-check-square', 'status:OPEN type:TASK'],
    ['smart-pendingApps', 'activityFeeds.filters.smart.pendingApplications', 'pi-hourglass',
      'status:PENDING type:APPLICATION'],
    ['smart-activeMaintenance', 'activityFeeds.filters.smart.activeMaintenance', 'pi-cog',
      'status:IN_PROGRESS type:MAINTENANCE'],
    ['status-pending', 'issueStatus.pending', 'pi-clock', 'status:PENDING'],
    ['status-open', 'issueStatus.open', 'pi-circle', 'status:OPEN'],
    ['status-inProgress', 'issueStatus.inProgress', 'pi-sync', 'status:IN_PROGRESS'],
    ['status-closed', 'issueStatus.closed', 'pi-check-circle', 'status:CLOSED'],
    ['status-rejected', 'issueStatus.rejected', 'pi-times-circle', 'status:REJECTED'],
    ['type-application', 'issueType.application', 'pi-file-edit', 'type:APPLICATION'],
    ['type-task', 'issueType.task', 'pi-list', 'type:TASK'],
    ['type-defect', 'issueType.defect', 'pi-exclamation-triangle', 'type:DEFECT'],
    ['type-maintenance', 'issueType.maintenance', 'pi-wrench', 'type:MAINTENANCE'],
    ['type-termination', 'issueType.termination', 'pi-sign-out', 'type:TERMINATION'],
    ['type-inquiry', 'issueType.inquiry', 'pi-question-circle', 'type:INQUIRY'],
  ];
  return filterData.map(([id, nameKey, icon, query]) => ({
    id: id as string,
    name: t(nameKey as string),
    icon: icon as string,
    query: query as string,
  }));
});

const activeFilterId = ref<string | null>(null);

onMounted(async () => {
  await activityFeed.fetchActivities();
});

const applyFilter = (filter: CustomFilter) => {
  if (activeFilterId.value === filter.id) {
    clearAllFilters();
    return;
  }

  activeFilterId.value = filter.id;
  activityFeed.clearFilters();
  const parts = filter.query.split(' ');
  parts.forEach(part => {
    const [key, val] = part.split(':');
    if (key === 'status' && val) filterIssueStatus.value = [val];
    if (key === 'type' && val) filterIssueType.value = [val];
  });
};

const clearAllFilters = () => {
  activeFilterId.value = null;
  activityFeed.clearFilters();
};

const handleActiveTabChange = (value: 'all' | 'unread') => {
  // Ensure a valid tab is always selected
  if (value === 'all' || value === 'unread') {
    activeTab.value = value;
  }
};

const toggleProjectFilter = (projectId: string) => {
  if (filterProject.value.includes(projectId)) {
    filterProject.value = [];
  } else {
    activityFeed.clearFilters();
    filterProject.value = [projectId];
  }
};

const navigateToIssue = (entry: ActivityFeedEntry) => {
  router.push({
    name: 'IssueDetails',
    params: { projectId: entry.projectId, issueId: entry.issueId }
  });
  if (!entry.read) activityFeed.markAsRead(entry);
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
    <template #content>
      <div class="flex h-full">
        <!-- Main Content -->
        <div class="flex-1 flex flex-col min-w-0 py-4 pr-4">
          <ActivityFeedToolbar
            :activeTab="activeTab"
            :searchQuery="searchQuery"
            :selectedCount="selectedEntries.length"
            @update:activeTab="handleActiveTabChange"
            @update:searchQuery="searchQuery = $event"
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
            @delete="handleEntryDelete"
            @loadMore="activityFeed.loadMoreActivities"
          />
        </div>

        <ActivityFeedSidebar
          :activeFilterId="activeFilterId"
          :customFilters="customFilters"
          :projectOptions="projectOptions"
          :filterProject="filterProject"
          :entries="entries"
          @filterApplied="applyFilter"
          @projectFilterToggled="toggleProjectFilter"
          @clearFilters="clearAllFilters"
        />
      </div>
    </template>
  </BaseCard>
</template>
