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

const customFilters = computed<CustomFilter[]>(() => [
  // Smart Filters (Kombinierte Filter)
  {
    id: 'smart-urgent',
    name: t('inbox.filters.smart.urgent'),
    icon: 'pi-exclamation-circle',
    query: 'status:OPEN type:DEFECT',
  },
  {
    id: 'smart-myTasks',
    name: t('inbox.filters.myTasks'),
    icon: 'pi-check-square',
    query: 'status:OPEN type:TASK',
  },
  {
    id: 'smart-pendingApps',
    name: t('inbox.filters.smart.pendingApplications'),
    icon: 'pi-hourglass',
    query: 'status:PENDING type:APPLICATION',
  },
  {
    id: 'smart-activeMaintenance',
    name: t('inbox.filters.smart.activeMaintenance'),
    icon: 'pi-cog',
    query: 'status:IN_PROGRESS type:MAINTENANCE',
  },
  
  // Status Filter
  {
    id: 'status-pending',
    name: t('inbox.filters.status.pending'),
    icon: 'pi-clock',
    query: 'status:PENDING',
  },
  {
    id: 'status-open',
    name: t('inbox.filters.status.open'),
    icon: 'pi-circle',
    query: 'status:OPEN',
  },
  {
    id: 'status-inProgress',
    name: t('inbox.filters.status.inProgress'),
    icon: 'pi-sync',
    query: 'status:IN_PROGRESS',
  },
  {
    id: 'status-closed',
    name: t('inbox.filters.status.closed'),
    icon: 'pi-check-circle',
    query: 'status:CLOSED',
  },
  {
    id: 'status-rejected',
    name: t('inbox.filters.status.rejected'),
    icon: 'pi-times-circle',
    query: 'status:REJECTED',
  },
  
  // Type Filter
  {
    id: 'type-application',
    name: t('inbox.filters.type.application'),
    icon: 'pi-file-edit',
    query: 'type:APPLICATION',
  },
  {
    id: 'type-task',
    name: t('inbox.filters.type.task'),
    icon: 'pi-list',
    query: 'type:TASK',
  },
  {
    id: 'type-defect',
    name: t('inbox.filters.type.defect'),
    icon: 'pi-exclamation-triangle',
    query: 'type:DEFECT',
  },
  {
    id: 'type-maintenance',
    name: t('inbox.filters.type.maintenance'),
    icon: 'pi-wrench',
    query: 'type:MAINTENANCE',
  },
]);

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
      @filterApplied="applyFilter"
      @projectFilterToggled="toggleProjectFilter"
      @clearFilters="clearAllFilters"
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
    </div>
  </div>
</template>
