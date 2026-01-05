<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';

import { useInboxStore } from '@/stores/InboxStore';
import type { InboxMessage } from '@/services/InboxService';
import InboxSidebar, { type CustomFilter } from '@/components/inbox/InboxSidebar.vue';
import InboxToolbar from '@/components/inbox/InboxToolbar.vue';
import InboxMessageList from '@/components/inbox/InboxMessageList.vue';

const { t } = useI18n();
const router = useRouter();
const inbox = useInboxStore();

const {
  messages,
  selectedMessages,
  activeTab,
  searchQuery,
  filterProject,
  filterIssueType,
  filterIssueStatus,
  filteredMessages,
  projectOptions,
  unreadCount,
  grouping,
} = storeToRefs(inbox);

const customFilters = computed<CustomFilter[]>(() => {
  const filterData = [
    ['smart-urgent', 'inbox.filters.smart.urgent', 'pi-exclamation-circle', 'status:OPEN type:DEFECT'],
    ['smart-myTasks', 'inbox.filters.myTasks', 'pi-check-square', 'status:OPEN type:TASK'],
    ['smart-pendingApps', 'inbox.filters.smart.pendingApplications', 'pi-hourglass', 'status:PENDING type:APPLICATION'],
    ['smart-activeMaintenance', 'inbox.filters.smart.activeMaintenance', 'pi-cog', 'status:IN_PROGRESS type:MAINTENANCE'],
    ['status-pending', 'inbox.filters.status.pending', 'pi-clock', 'status:PENDING'],
    ['status-open', 'inbox.filters.status.open', 'pi-circle', 'status:OPEN'],
    ['status-inProgress', 'inbox.filters.status.inProgress', 'pi-sync', 'status:IN_PROGRESS'],
    ['status-closed', 'inbox.filters.status.closed', 'pi-check-circle', 'status:CLOSED'],
    ['status-rejected', 'inbox.filters.status.rejected', 'pi-times-circle', 'status:REJECTED'],
    ['type-application', 'inbox.filters.type.application', 'pi-file-edit', 'type:APPLICATION'],
    ['type-task', 'inbox.filters.type.task', 'pi-list', 'type:TASK'],
    ['type-defect', 'inbox.filters.type.defect', 'pi-exclamation-triangle', 'type:DEFECT'],
    ['type-maintenance', 'inbox.filters.type.maintenance', 'pi-wrench', 'type:MAINTENANCE'],
  ];
  return filterData.map(([id, nameKey, icon, query]) => ({
    id: id as string,
    name: t(nameKey as string),
    icon: icon as string,
    query: query as string,
  }));
});

const activeFilterId = ref<string | null>(null);
const activeNavItem = ref<'inbox' | 'done'>('inbox');

onMounted(async () => {
  await inbox.fetchInbox();
});

const applyFilter = (filter: CustomFilter) => {
  if (activeFilterId.value === filter.id) {
    clearAllFilters();
    return;
  }
  
  activeFilterId.value = filter.id;
  inbox.clearFilters();
  const parts = filter.query.split(' ');
  parts.forEach(part => {
    const [key, val] = part.split(':');
    if (key === 'status' && val) filterIssueStatus.value = [val];
    if (key === 'type' && val) filterIssueType.value = [val];
  });
};

const clearAllFilters = () => {
  activeFilterId.value = null;
  inbox.clearFilters();
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
    inbox.clearFilters();
    filterProject.value = [projectId];
  }
};

const navigateToIssue = (msg: InboxMessage) => {
  router.push({ 
    name: 'IssueEdit', 
    params: { projectId: msg.projectId, issueId: msg.issueId } 
  });
  if (!msg.isRead) inbox.markAsRead(msg);
};

const toggleSelection = (msg: InboxMessage) => {
  const idx = selectedMessages.value.findIndex(m => m.id === msg.id);
  if (idx >= 0) selectedMessages.value.splice(idx, 1);
  else selectedMessages.value.push(msg);
};

const selectAll = () => {
  if (selectedMessages.value.length === displayedMessages.value.length) {
    selectedMessages.value = [];
  } else {
    selectedMessages.value = [...displayedMessages.value];
  }
};

const handleMessageSelect = (msg: InboxMessage) => {
  toggleSelection(msg);
};

const handleMessageNavigate = (msg: InboxMessage) => {
  navigateToIssue(msg);
};

const handleMessageMarkRead = (msg: InboxMessage) => {
  inbox.markAsRead(msg);
};

const handleMessageDelete = (msg: InboxMessage) => {
  selectedMessages.value = [msg];
  inbox.confirmDeleteSelected();
};

const doneCount = computed(() => messages.value.filter(m => m.isRead).length);

const displayedMessages = computed(() => {
  let msgs = filteredMessages.value;
  
  if (activeNavItem.value === 'done') {
    return msgs.filter(m => m.isRead);
  }
  
  return [...msgs].sort((a, b) => {
    if (!a.isRead && b.isRead) return -1;
    if (a.isRead && !b.isRead) return 1;
    return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
  });
});
</script>

<template>
  <div class="flex h-[calc(100vh-4rem)] bg-surface-100 dark:bg-surface-950">
    <InboxSidebar
      :activeNavItem="activeNavItem"
      :unreadCount="unreadCount"
      :doneCount="doneCount"
      :activeFilterId="activeFilterId"
      :customFilters="customFilters"
      :projectOptions="projectOptions"
      :filterProject="filterProject"
      :messages="messages"
      @update:activeNavItem="activeNavItem = $event"
      @filter-applied="applyFilter"
      @project-filter-toggled="toggleProjectFilter"
      @clear-filters="clearAllFilters"
    />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 py-4 pr-4">
      <div class="bg-white dark:bg-surface-900 rounded-xl overflow-hidden shadow-md h-full flex flex-col">
        <InboxToolbar
          :activeTab="activeTab"
          :searchQuery="searchQuery"
          :selectedCount="selectedMessages.length"
          :grouping="grouping"
          @update:activeTab="handleActiveTabChange"
          @update:searchQuery="searchQuery = $event"
          @update:grouping="grouping = $event"
          @mark-read-selected="inbox.markReadSelected"
          @delete-selected="inbox.confirmDeleteSelected"
        />

        <InboxMessageList
          :messages="displayedMessages"
          :selectedMessages="selectedMessages"
          :searchQuery="searchQuery"
          :grouping="grouping"
          @selectAll="selectAll"
          @selectItem="handleMessageSelect"
          @navigate="handleMessageNavigate"
          @markRead="handleMessageMarkRead"
          @delete="handleMessageDelete"
        />
      </div>
    </div>
  </div>
</template>
