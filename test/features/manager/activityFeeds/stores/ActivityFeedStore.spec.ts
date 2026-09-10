import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../mocks/server';
import { useActivityFeedStore } from '@/features/manager/activityFeeds/stores/ActivityFeedStore';
import type { ActivityFeedEntry } from '@/features/manager/activityFeeds/stores/ActivityFeedStore';
import { useProjectStore } from '@/stores/ProjectStore';
import { createMockActivityFeedEntry } from '../../../../utils/testHelpers';

function toRawActivity(entry: ActivityFeedEntry) {
  return {
    id: entry.id,
    projectId: entry.projectId,
    issueId: entry.issueId,
    title: entry.issueTitle,
    issueType: entry.issueType,
    status: entry.issueStatus,
    read: entry.read,
    createdAt: entry.createdAt.toISOString(),
  };
}

describe('ActivityFeedStore', () => {
  let store: ReturnType<typeof useActivityFeedStore>;

  const mockEntries: ActivityFeedEntry[] = [
    createMockActivityFeedEntry({
      id: '1',
      createdAt: new Date('2025-01-10T10:00:00Z'),
      read: false,
      issueId: 'issue-101',
      issueTitle: 'Test Issue 1',
      issueType: 'DEFECT',
      issueStatus: 'OPEN',
      projectId: 'proj-1',
      projectName: 'Project 1',
    }),
    createMockActivityFeedEntry({
      id: '2',
      createdAt: new Date('2025-01-11T10:00:00Z'),
      read: true,
      issueId: 'issue-102',
      issueTitle: 'Test Issue 2',
      issueType: 'TASK',
      issueStatus: 'CLOSED',
      projectId: 'proj-2',
      projectName: 'Project 2',
    }),
    createMockActivityFeedEntry({
      id: '3',
      createdAt: new Date('2025-01-12T10:00:00Z'),
      read: false,
      issueId: 'issue-103',
      issueTitle: 'Test Issue 3',
      issueType: 'MAINTENANCE',
      issueStatus: 'IN_PROGRESS',
      projectId: 'proj-1',
      projectName: 'Project 1',
    }),
  ];

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useActivityFeedStore();

    const projectStore = useProjectStore();
    projectStore.projects = [
      {
        id: 'proj-1', name: 'Project 1', memberRole: 'MANAGER' 
      },
      {
        id: 'proj-2', name: 'Project 2', memberRole: 'MANAGER' 
      },
    ];

    server.use(
      http.get('/ticketing/v1/activities', () => {
        return HttpResponse.json({
          size: mockEntries.length,
          nextCursor: null,
          activities: mockEntries.map(toRawActivity),
        });
      }),
      http.patch('/ticketing/v1/activities/:activityId/status', () => {
        return HttpResponse.json({});
      }),
      http.delete('/ticketing/v1/activities/:activityId', () => {
        return new HttpResponse(null, { status: 204 });
      }),
    );
  });

  describe('fetchActivities', () => {
    it('loads entries, resolves project names, and normalizes createdAt', async () => {
      await store.fetchActivities();

      expect(store.entries).toHaveLength(3);
      expect(store.entries[0].id).toBe('1');
      expect(store.entries[0].createdAt).toBeInstanceOf(Date);
      expect(store.entries[0].projectName).toBe('Project 1');
      expect(store.isLoading).toBe(false);
    });

    it('sets hasMore based on nextCursor', async () => {
      server.use(
        http.get('/ticketing/v1/activities', () => {
          return HttpResponse.json({
            size: 1,
            nextCursor: 'cursor-1',
            activities: [toRawActivity(mockEntries[0])],
          });
        }),
      );

      await store.fetchActivities();

      expect(store.hasMore).toBe(true);
    });

    it('populates the project list when it is empty', async () => {
      const projectStore = useProjectStore();
      projectStore.projects = [];
      const refreshSpy = vi.spyOn(projectStore, 'refreshProjectList').mockImplementation(async () => {
        projectStore.projects = [
          {
            id: 'proj-1', name: 'Project 1', memberRole: 'MANAGER' 
          },
          {
            id: 'proj-2', name: 'Project 2', memberRole: 'MANAGER' 
          },
        ];
      });

      await store.fetchActivities();

      expect(refreshSpy).toHaveBeenCalledTimes(1);
      expect(store.entries[0].projectName).toBe('Project 1');
    });

    it('does not refresh the project list when it is already populated', async () => {
      const projectStore = useProjectStore();
      const refreshSpy = vi.spyOn(projectStore, 'refreshProjectList');

      await store.fetchActivities();

      expect(refreshSpy).not.toHaveBeenCalled();
    });

    it('falls back to the projectId when the project name cannot be resolved', async () => {
      const projectStore = useProjectStore();
      projectStore.projects = [];
      vi.spyOn(projectStore, 'refreshProjectList').mockResolvedValue(undefined);

      await store.fetchActivities();

      expect(store.entries[0].projectName).toBe('proj-1');
    });

    it('drops structurally incomplete entries', async () => {
      server.use(
        http.get('/ticketing/v1/activities', () => {
          return HttpResponse.json({
            size: 2,
            nextCursor: null,
            activities: [
              toRawActivity(mockEntries[0]),
              { ...toRawActivity(mockEntries[1]), issueId: undefined },
            ],
          });
        }),
      );

      await store.fetchActivities();

      expect(store.entries).toHaveLength(1);
      expect(store.entries[0].id).toBe('1');
    });

    it('defaults read and title when missing from the raw entry', async () => {
      server.use(
        http.get('/ticketing/v1/activities', () => {
          return HttpResponse.json({
            size: 1,
            nextCursor: null,
            activities: [
              {
                ...toRawActivity(mockEntries[0]), read: undefined, title: undefined 
              },
            ],
          });
        }),
      );

      await store.fetchActivities();

      expect(store.entries[0].read).toBe(false);
      expect(store.entries[0].issueTitle).toBe('');
    });

    it('defaults entries to an empty array when the response has no activities', async () => {
      server.use(
        http.get('/ticketing/v1/activities', () => {
          return HttpResponse.json({ size: 0, nextCursor: null });
        }),
      );

      await store.fetchActivities();

      expect(store.entries).toEqual([]);
    });
  });

  describe('loadMoreActivities', () => {
    it('appends the next page and updates the cursor', async () => {
      server.use(
        http.get('/ticketing/v1/activities', ({ request }) => {
          const url = new URL(request.url);
          if (url.searchParams.get('cursor')) {
            return HttpResponse.json({
              size: 1,
              nextCursor: null,
              activities: [toRawActivity(mockEntries[2])],
            });
          }
          return HttpResponse.json({
            size: 2,
            nextCursor: 'cursor-1',
            activities: [toRawActivity(mockEntries[0]), toRawActivity(mockEntries[1])],
          });
        }),
      );

      await store.fetchActivities();
      expect(store.entries).toHaveLength(2);
      expect(store.hasMore).toBe(true);

      await store.loadMoreActivities();

      expect(store.entries).toHaveLength(3);
      expect(store.hasMore).toBe(false);
    });

    it('does nothing when there is no further page', async () => {
      await store.fetchActivities();
      expect(store.hasMore).toBe(false);

      await store.loadMoreActivities();

      expect(store.entries).toHaveLength(3);
    });

    it('appends nothing when the next page has no activities', async () => {
      server.use(
        http.get('/ticketing/v1/activities', ({ request }) => {
          const url = new URL(request.url);
          if (url.searchParams.get('cursor')) {
            return HttpResponse.json({ size: 0, nextCursor: null });
          }
          return HttpResponse.json({
            size: 1,
            nextCursor: 'cursor-1',
            activities: [toRawActivity(mockEntries[0])],
          });
        }),
      );

      await store.fetchActivities();
      expect(store.entries).toHaveLength(1);

      await store.loadMoreActivities();

      expect(store.entries).toHaveLength(1);
      expect(store.hasMore).toBe(false);
    });
  });

  describe('markAsRead', () => {
    beforeEach(async () => {
      store.entries = mockEntries.map(entry => ({ ...entry, createdAt: new Date(entry.createdAt) }));
    });

    it('calls service and updates local state optimistically', async () => {
      const entry = store.entries[0];
      expect(entry.read).toBe(false);

      await store.markAsRead(entry);

      expect(entry.read).toBe(true);
      expect(store.entries[0].read).toBe(true);
    });

    it('does nothing when the entry is not found in the store', async () => {
      const unknownEntry = createMockActivityFeedEntry({ id: 'unknown-id' });

      await expect(store.markAsRead(unknownEntry)).resolves.not.toThrow();

      expect(store.entries.find(e => e.id === 'unknown-id')).toBeUndefined();
    });

    it('handles errors gracefully', async () => {
      store.entries = mockEntries.map(entry => ({ ...entry }));
      server.use(
        http.patch('/ticketing/v1/activities/:activityId/status', () => {
          return HttpResponse.json({ error: 'Not found' }, { status: 404 });
        }),
      );

      const entry = store.entries[0];
      const originalRead = entry.read;

      await expect(store.markAsRead(entry)).resolves.not.toThrow();

      const entryAfterError = store.entries.find(e => e.id === entry.id);
      expect(entryAfterError?.read).toBe(originalRead);
    });
  });

  describe('markReadSelected', () => {
    beforeEach(async () => {
      store.entries = mockEntries.map(entry => ({ ...entry, createdAt: new Date(entry.createdAt) }));
      store.selectedEntries = [store.entries[0], store.entries[2]];
    });

    it('calls service for all selected entries and updates local state', async () => {
      const entry1 = { ...mockEntries[0], read: false };
      const entry2 = { ...mockEntries[1], read: true };
      const entry3 = { ...mockEntries[2], read: false };
      store.entries = [entry1, entry2, entry3];
      store.selectedEntries = [entry1, entry3];

      expect(store.selectedEntries).toHaveLength(2);
      expect(entry1.read).toBe(false);
      expect(entry3.read).toBe(false);

      await store.markReadSelected();

      expect(entry1.read).toBe(true);
      expect(entry3.read).toBe(true);
      expect(store.selectedEntries).toHaveLength(0);
    });

    it('clears selection after marking as read', async () => {
      await store.markReadSelected();
      expect(store.selectedEntries).toHaveLength(0);
    });

    it('reverts optimistic updates when the API call fails', async () => {
      const originalStates = store.entries.map(e => e.read);
      server.use(
        http.patch('/ticketing/v1/activities/:activityId/status', () => {
          return HttpResponse.json({ error: 'Not found' }, { status: 404 });
        }),
      );

      await expect(store.markReadSelected()).resolves.not.toThrow();

      expect(store.entries.map(e => e.read)).toEqual(originalStates);
    });
  });

  describe('confirmDeleteSelected', () => {
    beforeEach(async () => {
      store.entries = mockEntries.map(entry => ({ ...entry, createdAt: new Date(entry.createdAt) }));
      store.selectedEntries = [store.entries[0], store.entries[1]];
    });

    it('calls service for all selected entries and removes them from local state', async () => {
      const initialLength = store.entries.length;
      expect(store.selectedEntries).toHaveLength(2);

      await store.confirmDeleteSelected();

      expect(store.entries).toHaveLength(initialLength - 2);
      expect(store.entries.find(e => e.id === '1')).toBeUndefined();
      expect(store.entries.find(e => e.id === '2')).toBeUndefined();
      expect(store.selectedEntries).toHaveLength(0);
    });

    it('restores deleted entries when the API call fails', async () => {
      store.entries = mockEntries.map(entry => ({ ...entry }));
      store.selectedEntries = [store.entries[0], store.entries[1]];
      const initialLength = store.entries.length;

      server.use(
        http.delete('/ticketing/v1/activities/:activityId', () => {
          return HttpResponse.json({ error: 'Not found' }, { status: 404 });
        }),
      );

      await expect(store.confirmDeleteSelected()).resolves.not.toThrow();

      expect(store.entries).toHaveLength(initialLength);
      expect(store.entries.find(e => e.id === '1')).toBeDefined();
      expect(store.entries.find(e => e.id === '2')).toBeDefined();
    });
  });

  describe('filteredEntries', () => {
    beforeEach(() => {
      store.entries = mockEntries.map(entry => ({ ...entry, createdAt: new Date(entry.createdAt) }));
    });

    it('filters by activeTab unread', () => {
      store.activeTab = 'unread';
      const filtered = store.filteredEntries;

      expect(filtered).toHaveLength(2);
      expect(filtered.every(e => !e.read)).toBe(true);
    });

    it('filters by activeTab all', () => {
      store.activeTab = 'all';
      const filtered = store.filteredEntries;

      expect(filtered).toHaveLength(3);
    });

    it('filters by search query', () => {
      store.searchQuery = 'Issue 1';
      const filtered = store.filteredEntries;

      expect(filtered).toHaveLength(1);
      expect(filtered[0].issueTitle).toBe('Test Issue 1');
    });

    it('filters by project', () => {
      store.filterProject = ['proj-1'];
      const filtered = store.filteredEntries;

      expect(filtered).toHaveLength(2);
      expect(filtered.every(e => e.projectId === 'proj-1')).toBe(true);
    });

    it('filters by issue type', () => {
      store.filterIssueType = ['DEFECT'];
      const filtered = store.filteredEntries;

      expect(filtered).toHaveLength(1);
      expect(filtered[0].issueType).toBe('DEFECT');
    });

    it('filters by issue status', () => {
      store.filterIssueStatus = ['OPEN'];
      const filtered = store.filteredEntries;

      expect(filtered).toHaveLength(1);
      expect(filtered[0].issueStatus).toBe('OPEN');
    });

    it('combines multiple filters', () => {
      store.activeTab = 'unread';
      store.filterProject = ['proj-1'];
      store.filterIssueType = ['DEFECT'];
      const filtered = store.filteredEntries;

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    it('filters by a valid date range', () => {
      store.filterDateRange = [new Date('2025-01-10T00:00:00Z'), new Date('2025-01-11T00:00:00Z')];
      const filtered = store.filteredEntries;

      expect(filtered.map(e => e.id).sort()).toEqual(['1', '2']);
    });

    it('excludes entries outside the date range', () => {
      store.filterDateRange = [new Date('2025-02-01T00:00:00Z'), new Date('2025-02-02T00:00:00Z')];
      const filtered = store.filteredEntries;

      expect(filtered).toHaveLength(0);
    });

    it('ignores an incomplete date range', () => {
      store.filterDateRange = [undefined as unknown as Date, undefined as unknown as Date];
      const filtered = store.filteredEntries;

      expect(filtered).toHaveLength(mockEntries.length);
    });
  });

  describe('issueTypeOptions', () => {
    beforeEach(() => {
      store.entries = [...mockEntries];
    });

    it('returns unique issue type options', () => {
      const options = store.issueTypeOptions;

      expect(options.map(o => o.value).sort()).toEqual(['DEFECT', 'MAINTENANCE', 'TASK']);
    });
  });

  describe('issueStatusOptions', () => {
    beforeEach(() => {
      store.entries = [...mockEntries];
    });

    it('returns unique issue status options', () => {
      const options = store.issueStatusOptions;

      expect(options.map(o => o.value).sort()).toEqual(['CLOSED', 'IN_PROGRESS', 'OPEN']);
    });
  });

  describe('unreadCount', () => {
    beforeEach(() => {
      store.entries = mockEntries.map(entry => ({ ...entry, createdAt: new Date(entry.createdAt) }));
    });

    it('calculates unread count correctly', () => {
      expect(store.unreadCount).toBe(2);
    });

    it('updates when entries are marked as read', async () => {
      expect(store.unreadCount).toBe(2);

      // Find first unread entry
      const unreadEntry = store.entries.find(e => !e.read);
      expect(unreadEntry).toBeDefined();

      await store.markAsRead(unreadEntry!);

      expect(store.unreadCount).toBe(1);
    });
  });

  describe('projectOptions', () => {
    beforeEach(async () => {
      store.entries = [...mockEntries];
    });

    it('returns unique project options', () => {
      const options = store.projectOptions;

      expect(options).toHaveLength(2);
      expect(options.find(o => o.value === 'proj-1')?.label).toBe('Project 1');
      expect(options.find(o => o.value === 'proj-2')?.label).toBe('Project 2');
    });
  });

  describe('clearFilters', () => {
    it('clears all filters', () => {
      store.filterProject = ['proj-1'];
      store.filterIssueType = ['DEFECT'];
      store.filterIssueStatus = ['OPEN'];
      store.searchQuery = 'test';
      store.filterDateRange = [new Date(), new Date()];

      store.clearFilters();

      expect(store.filterProject).toHaveLength(0);
      expect(store.filterIssueType).toHaveLength(0);
      expect(store.filterIssueStatus).toHaveLength(0);
      expect(store.searchQuery).toBe('');
      expect(store.filterDateRange).toBeNull();
    });
  });
});
