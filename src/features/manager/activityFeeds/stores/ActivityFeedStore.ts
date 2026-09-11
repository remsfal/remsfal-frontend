import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { activityFeedService, type ActivityFeedJson } from '../services/ActivityFeedService';
import { resolveProjectName } from '../composables/useActivityFeedHelpers';
import { useProjectStore } from '@/stores/ProjectStore';
import type { IssueType, IssueStatus } from '@/features/project/issues/services/IssueService';

const PAGE_LIMIT = 50;

export interface ActivityFeedEntry {
  id: string;
  createdAt: Date;
  read: boolean;

  // Issue data
  issueId: string;
  issueTitle: string;
  issueType: IssueType;
  issueStatus: IssueStatus;

  // Project data
  projectId: string;
  projectName: string;
}

export const useActivityFeedStore = defineStore('activity-feed', () => {
  const projectStore = useProjectStore();

  const entries = ref<ActivityFeedEntry[]>([]);
  const isLoading = ref<boolean>(true);
  const isLoadingMore = ref<boolean>(false);
  const nextCursor = ref<string | null>(null);
  const selectedEntries = ref<ActivityFeedEntry[]>([]);
  const isDeleteDialogVisible = ref<boolean>(false);

  const filterProject = ref<string[]>([]);
  const filterIssueType = ref<string[]>([]);
  const filterIssueStatus = ref<string[]>([]);
  const filterDateRange = ref<Date[] | null>(null);
  const searchQuery = ref<string>('');
  const activeTab = ref<'all' | 'unread'>('all');
  const grouping = ref<'date' | 'project' | null>(null);

  /**
   * Returns the count of unread entries.
   */
  const unreadCount = computed(() => entries.value.filter(e => !e.read).length);

  /**
   * Whether a further page of activities is available.
   */
  const hasMore = computed(() => nextCursor.value !== null);

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
   * Filters entries based on active tab, search query, and all filter criteria.
   * Applies filters for: activeTab (all/unread), search query, project, issue type, issue status, and date range.
   */
  const filteredEntries = computed<ActivityFeedEntry[]>(() => {
    const { start, end } = dateRangeStartEnd.value;
    const hasRange = !!(start && end);
    const query = searchQuery.value.toLowerCase();

    return entries.value.filter((entry) => {
      // Tab Filter (All vs Unread)
      if (activeTab.value === 'unread' && entry.read) return false;

      // Search
      const inSearch = !query ||
        entry.issueTitle.toLowerCase().includes(query) ||
        entry.projectName.toLowerCase().includes(query);

      // Sidebar Filters
      const inProject     = !filterProject.value.length     || filterProject.value.includes(entry.projectId);
      const inIssueType   = !filterIssueType.value.length   || filterIssueType.value.includes(entry.issueType);
      const inIssueStatus = !filterIssueStatus.value.length || filterIssueStatus.value.includes(entry.issueStatus);

      const inDate = !hasRange ||
        (!!entry.createdAt && entry.createdAt >= (start as Date) && entry.createdAt <= (end as Date));

      return inSearch && inProject && inIssueType && inIssueStatus && inDate;
    });
  });

  /**
   * Returns unique project options for filter dropdowns.
   * Maps projectId to projectName for display purposes.
   */
  const projectOptions = computed(() => {
    const map = new Map<string, string>();
    entries.value.forEach(e => map.set(e.projectId, e.projectName));
    return Array.from(map.entries()).map(([value, label]) => ({ label, value }));
  });

  /**
   * Returns unique issue type options for filter dropdowns.
   */
  const issueTypeOptions = computed(() =>
    Array.from(new Set(entries.value.map(e => e.issueType))).map(v => ({ label: v, value: v }))
  );

  /**
   * Returns unique issue status options for filter dropdowns.
   */
  const issueStatusOptions = computed(() =>
    Array.from(new Set(entries.value.map(e => e.issueStatus))).map(v => ({ label: v, value: v }))
  );

  /**
   * Ensures the global project list is populated so project names can be resolved,
   * since ActivityFeed can be the first page a manager visits in a session.
   */
  async function ensureProjectListLoaded() {
    if (projectStore.projectList.length === 0) {
      await projectStore.refreshProjectList();
    }
  }

  /**
   * Normalizes a raw activity into an ActivityFeedEntry, resolving the project name
   * and coercing the createdAt timestamp into a Date. Entries missing an id, issueId,
   * projectId, or createdAt are structurally incomplete and are dropped.
   */
  function normalizeEntry(raw: ActivityFeedJson): ActivityFeedEntry | null {
    if (!raw.id || !raw.issueId || !raw.projectId || !raw.createdAt) {
      console.warn('Skipping malformed activity feed entry', raw);
      return null;
    }
    return {
      id: raw.id,
      createdAt: new Date(raw.createdAt),
      read: raw.read ?? false,
      issueId: raw.issueId,
      issueTitle: raw.title ?? '',
      issueType: raw.issueType as IssueType,
      issueStatus: raw.status as IssueStatus,
      projectId: raw.projectId,
      projectName: resolveProjectName(raw.projectId, projectStore.projectList),
    };
  }

  /**
   * Fetches the first page of activities from the API and replaces the store's entries.
   * Sets isLoading flag during the operation.
   */
  async function fetchActivities() {
    isLoading.value = true;
    try {
      await ensureProjectListLoaded();
      const page = await activityFeedService.fetchActivities({ limit: PAGE_LIMIT });
      entries.value = (page.activities ?? [])
        .map(normalizeEntry)
        .filter((e): e is ActivityFeedEntry => e !== null);
      nextCursor.value = page.nextCursor ?? null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetches the next page of activities (if any) and appends them to the store's entries.
   * Sets isLoadingMore flag during the operation, distinct from the initial-load isLoading flag.
   */
  async function loadMoreActivities() {
    if (!nextCursor.value || isLoadingMore.value) return;
    isLoadingMore.value = true;
    try {
      await ensureProjectListLoaded();
      const page = await activityFeedService.fetchActivities({
        limit: PAGE_LIMIT,
        cursor: nextCursor.value,
      });
      const newEntries = (page.activities ?? [])
        .map(normalizeEntry)
        .filter((e): e is ActivityFeedEntry => e !== null);
      entries.value = [...entries.value, ...newEntries];
      nextCursor.value = page.nextCursor ?? null;
    } finally {
      isLoadingMore.value = false;
    }
  }

  /**
   * Marks a single entry as read.
   * Performs optimistic update before API call and reverts on error.
   * @param entry - The entry to mark as read
   */
  async function markAsRead(entry: ActivityFeedEntry) {
    const entryInStore = entries.value.find(e => e.id === entry.id);
    if (!entryInStore) return;

    const originalRead = entryInStore.read;
    try {
      // Optimistic update: update local state immediately
      entryInStore.read = true;
      entries.value = [...entries.value];
      await activityFeedService.setReadStatus(entry.id, true);
    } catch (error) {
      // Revert optimistic update on error
      entryInStore.read = originalRead;
      entries.value = [...entries.value];
      console.error('Failed to mark activity as read:', error);
    }
  }

  /**
   * Marks all selected entries as read.
   * Performs optimistic update for all selected entries and calls API in parallel.
   * Reverts all changes if any API call fails. Clears selection on success.
   */
  async function markReadSelected() {
    const ids = selectedEntries.value.map(e => e.id);
    const originalStates = new Map(selectedEntries.value.map(e => [e.id, e.read]));

    try {
      // Optimistic update: update local state
      entries.value.forEach(e => {
        if (ids.includes(e.id)) {
          e.read = true;
        }
      });
      entries.value = [...entries.value];

      // Call API for all selected entries
      await Promise.all(ids.map(id => activityFeedService.setReadStatus(id, true)));
      selectedEntries.value = [];
    } catch (error) {
      // Revert optimistic update on error
      entries.value.forEach(e => {
        if (ids.includes(e.id) && originalStates.has(e.id)) {
          e.read = originalStates.get(e.id)!;
        }
      });
      entries.value = [...entries.value];
      console.error('Failed to mark activities as read:', error);
    }
  }

  /**
   * Permanently deletes all selected entries.
   * Performs optimistic update by removing entries from local state immediately.
   * Calls API in parallel for all selected entries and restores entries on error.
   * Clears selection and closes delete dialog on success.
   */
  async function confirmDeleteSelected() {
    const ids = new Set(selectedEntries.value.map(e => e.id));
    // Save entries before deletion for potential rollback - create deep copies
    const entriesToDelete = entries.value
      .filter(e => ids.has(e.id))
      .map(e => ({ ...e, createdAt: new Date(e.createdAt) }));

    try {
      // Optimistic update: remove from local state
      entries.value = entries.value.filter(e => !ids.has(e.id));
      selectedEntries.value = [];

      // Call API for all selected entries
      await Promise.all(Array.from(ids).map(id => activityFeedService.deleteActivity(id)));
      isDeleteDialogVisible.value = false;
    } catch (error) {
      // Revert optimistic update on error - restore deleted entries
      entries.value = [...entries.value, ...entriesToDelete];
      console.error('Failed to delete activities:', error);
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
    entries,
    isLoading,
    isLoadingMore,
    hasMore,
    selectedEntries,
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
    filteredEntries,
    unreadCount,
    projectOptions,
    issueTypeOptions,
    issueStatusOptions,

    // Actions
    fetchActivities,
    loadMoreActivities,
    markAsRead,
    markReadSelected,
    confirmDeleteSelected,
    clearFilters,
  };
});
