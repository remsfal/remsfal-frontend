<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';

import BaseCard from '@/components/common/BaseCard.vue';
import { useInboxStore } from '../stores/InboxStore';
import type { InboxMessage } from '../services/InboxService';
import InboxSidebar, { type CustomFilter } from './InboxSidebar.vue';
import InboxToolbar from './InboxToolbar.vue';
import InboxMessageList from './InboxMessageList.vue';

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
    name: 'IssueDetails', 
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

const displayedMessages = computed(() => {
  return [...filteredMessages.value].sort((a, b) => {
    if (!a.isRead && b.isRead) return -1;
    if (a.isRead && !b.isRead) return 1;
    return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
  });
});
</script>

<template>
  <BaseCard>
    <template #content>
      <div class="flex h-full">
        <!-- Main Content -->
        <div class="flex-1 flex flex-col min-w-0 py-4 pr-4">
          <InboxToolbar
            :activeTab="activeTab"
            :searchQuery="searchQuery"
            :selectedCount="selectedMessages.length"
            @update:activeTab="handleActiveTabChange"
            @update:searchQuery="searchQuery = $event"
            @markReadSelected="inbox.markReadSelected"
            @deleteSelected="inbox.confirmDeleteSelected"
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

        <InboxSidebar
          :activeFilterId="activeFilterId"
          :customFilters="customFilters"
          :projectOptions="projectOptions"
          :filterProject="filterProject"
          :messages="messages"
          @filterApplied="applyFilter"
          @projectFilterToggled="toggleProjectFilter"
          @clearFilters="clearAllFilters"
        />
      </div>
    </template>
  </BaseCard>
</template>
