import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { inboxService, type InboxMessage } from '@/services/InboxService';

/**
 * Normalizes message dates by converting string dates to Date objects.
 * @param m - The inbox message to normalize
 * @returns The normalized message with proper Date object
 */
function normalizeMessage(m: InboxMessage): InboxMessage {
  const received = (m as any).receivedAt;
  if (received && !(received instanceof Date)) {
    (m as any).receivedAt = new Date(received);
  }
  return m;
}

export const useInboxStore = defineStore('inbox', () => {
  const messages = ref<InboxMessage[]>([]);
  const isLoading = ref<boolean>(true);
  const selectedMessages = ref<InboxMessage[]>([]);
  const isDeleteDialogVisible = ref<boolean>(false);

  const filterProject = ref<string[]>([]);
  const filterIssueType = ref<string[]>([]);
  const filterIssueStatus = ref<string[]>([]);
  const filterDateRange = ref<Date[] | null>(null);
  const searchQuery = ref<string>('');
  const activeTab = ref<'all' | 'unread'>('all');
  const grouping = ref<'date' | 'project' | null>(null);

  /**
   * Returns the count of unread messages.
   */
  const unreadCount = computed(() => messages.value.filter(m => !m.isRead).length);

  /**
   * Checks if a valid date range filter is set.
   */
  const hasDateRange = computed(() => filterDateRange.value?.length === 2);

  /**
   * Returns normalized start and end dates for date range filtering.
   * Start date is set to 00:00:00 and end date is set to 23:59:59.
   */
  const dateRangeStartEnd = computed(() => {
    if (!hasDateRange.value) return { start: undefined as Date | undefined, end: undefined as Date | undefined };
    const [from, to] = filterDateRange.value!;
    if (!from || !to) return { start: undefined, end: undefined };
    const start = new Date(from); start.setHours(0, 0, 0, 0);
    const end   = new Date(to);   end.setHours(23, 59, 59, 999);
    return { start, end };
  });

  /**
   * Filters messages based on active tab, search query, and all filter criteria.
   * Applies filters for: activeTab (all/unread), search query, project, issue type, issue status, and date range.
   */
  const filteredMessages = computed<InboxMessage[]>(() => {
    const { start, end } = dateRangeStartEnd.value;
    const hasRange = !!(start && end);
    const query = searchQuery.value.toLowerCase();

    return messages.value.filter((msg) => {
      // Tab Filter (All vs Unread)
      if (activeTab.value === 'unread' && msg.isRead) return false;

      // Search
      const inSearch = !query || 
        msg.issueTitle.toLowerCase().includes(query) || 
        msg.projectName.toLowerCase().includes(query);

      // Sidebar Filters
      const inProject     = !filterProject.value.length     || filterProject.value.includes(msg.projectId);
      const inIssueType   = !filterIssueType.value.length   || filterIssueType.value.includes(msg.issueType);
      const inIssueStatus = !filterIssueStatus.value.length || filterIssueStatus.value.includes(msg.issueStatus);
      
      const inDate = !hasRange ||
        (!!msg.receivedAt && msg.receivedAt >= (start as Date) && msg.receivedAt <= (end as Date));

      return inSearch && inProject && inIssueType && inIssueStatus && inDate;
    });
  });

  /**
   * Returns unique project options for filter dropdowns.
   * Maps projectId to projectName for display purposes.
   */
  const projectOptions = computed(() => {
    const map = new Map<string, string>();
    messages.value.forEach(m => map.set(m.projectId, m.projectName));
    return Array.from(map.entries()).map(([value, label]) => ({ label, value }));
  });

  /**
   * Returns unique issue type options for filter dropdowns.
   */
  const issueTypeOptions = computed(() =>
    Array.from(new Set(messages.value.map(m => m.issueType))).map(v => ({ label: v, value: v }))
  );

  /**
   * Returns unique issue status options for filter dropdowns.
   */
  const issueStatusOptions = computed(() =>
    Array.from(new Set(messages.value.map(m => m.issueStatus))).map(v => ({ label: v, value: v }))
  );

  /**
   * Computed property for grouped messages (currently returns filtered messages as-is).
   * Reserved for future grouping functionality by date or project.
   */
  const groupedMessages = computed(() => {
    return filteredMessages.value;
  });

  /**
   * Fetches all inbox messages from the API and updates the store.
   * Sets isLoading flag during the operation and normalizes message dates.
   */
  async function fetchInbox() {
    isLoading.value = true;
    try {
      const data = await inboxService.fetchInboxData();
      messages.value = data.map(normalizeMessage);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Marks a single message as read.
   * Performs optimistic update before API call and reverts on error.
   * @param msg - The message to mark as read
   */
  async function markAsRead(msg: InboxMessage) {
    const messageInStore = messages.value.find(m => m.id === msg.id);
    if (!messageInStore) return;
    
    const originalIsRead = messageInStore.isRead;
    try {
      // Optimistic update: update local state immediately
      messageInStore.isRead = true;
      messages.value = [...messages.value];
      await inboxService.markAsRead(msg.id);
    } catch (error) {
      // Revert optimistic update on error
      messageInStore.isRead = originalIsRead;
      messages.value = [...messages.value];
      console.error('Failed to mark message as read:', error);
    }
  }

  /**
   * Marks all selected messages as read.
   * Performs optimistic update for all selected messages and calls API in parallel.
   * Reverts all changes if any API call fails. Clears selection on success.
   */
  async function markReadSelected() {
    const ids = selectedMessages.value.map(m => m.id);
    const originalStates = new Map(selectedMessages.value.map(m => [m.id, m.isRead]));
    
    try {
      // Optimistic update: update local state
      messages.value.forEach(m => {
        if (ids.includes(m.id)) {
          m.isRead = true;
        }
      });
      messages.value = [...messages.value];
      
      // Call API for all selected messages
      await Promise.all(ids.map(id => inboxService.markAsRead(id)));
      selectedMessages.value = [];
    } catch (error) {
      // Revert optimistic update on error
      messages.value.forEach(m => {
        if (ids.includes(m.id) && originalStates.has(m.id)) {
          m.isRead = originalStates.get(m.id)!;
        }
      });
      messages.value = [...messages.value];
      console.error('Failed to mark messages as read:', error);
    }
  }

  /**
   * Permanently deletes all selected messages.
   * Performs optimistic update by removing messages from local state immediately.
   * Calls API in parallel for all selected messages and restores messages on error.
   * Clears selection and closes delete dialog on success.
   */
  async function confirmDeleteSelected() {
    const ids = new Set(selectedMessages.value.map(m => m.id));
    // Save messages before deletion for potential rollback - create deep copies
    const messagesToDelete = messages.value
      .filter(m => ids.has(m.id))
      .map(m => ({ ...m, receivedAt: new Date(m.receivedAt) }));
    
    try {
      // Optimistic update: remove from local state
      messages.value = messages.value.filter(m => !ids.has(m.id));
      selectedMessages.value = [];
      
      // Call API for all selected messages
      await Promise.all(Array.from(ids).map(id => inboxService.deleteMessage(id)));
      isDeleteDialogVisible.value = false;
    } catch (error) {
      // Revert optimistic update on error - restore deleted messages
      messages.value = [...messages.value, ...messagesToDelete];
      console.error('Failed to delete messages:', error);
    }
  }

  /**
   * Clears all active filters and search query.
   * Resets project, issue type, issue status, date range filters, and search query to initial state.
   */
  function clearFilters() {
    filterProject.value = [];
    filterIssueType.value = [];
    filterIssueStatus.value = [];
    filterDateRange.value = null;
    searchQuery.value = '';
  }

  return {
    // State
    messages,
    isLoading,
    selectedMessages,
    isDeleteDialogVisible,
    
    // Filters State
    filterProject,
    filterIssueType,
    filterIssueStatus,
    filterDateRange,
    searchQuery,
    activeTab,
    grouping,

    // Getters
    filteredMessages,
    unreadCount,
    projectOptions,
    issueTypeOptions,
    issueStatusOptions,
    groupedMessages,

    // Actions
    fetchInbox,
    markAsRead,
    markReadSelected,
    confirmDeleteSelected,
    clearFilters,
  };
});

