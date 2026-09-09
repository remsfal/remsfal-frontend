import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../mocks/server';
import ActivityFeedCard from '@/features/manager/activityFeeds/components/ActivityFeedCard.vue';
import { useActivityFeedStore } from '@/features/manager/activityFeeds/stores/ActivityFeedStore';
import ActivityFeedSidebar from '@/features/manager/activityFeeds/components/ActivityFeedSidebar.vue';
import ActivityFeedToolbar from '@/features/manager/activityFeeds/components/ActivityFeedToolbar.vue';
import ActivityFeedList from '@/features/manager/activityFeeds/components/ActivityFeedList.vue';
import type { ActivityFeedEntry } from '@/features/manager/activityFeeds/stores/ActivityFeedStore';
import { createMockActivityFeedEntry } from '../../../../utils/testHelpers';

// Mocks
const mockPush = vi.fn();
vi.mock('vue-router', () => ({ useRouter: () => ({ push: mockPush }) }));

describe('ActivityFeedCard.vue', () => {
  let wrapper: VueWrapper;
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
  ];


  beforeEach(async () => {
    store = useActivityFeedStore();

    server.use(
      http.get('/api/v1/activities', () => {
        return HttpResponse.json({
          size: mockEntries.length,
          nextCursor: null,
          activities: mockEntries.map(e => ({
            id: e.id,
            projectId: e.projectId,
            issueId: e.issueId,
            title: e.issueTitle,
            issueType: e.issueType,
            status: e.issueStatus,
            read: e.read,
            createdAt: e.createdAt.toISOString(),
          })),
        });
      }),
      http.get('/api/v1/projects', () => {
        return HttpResponse.json({
          first: 1, size: 0, total: 0, projects: [] 
        });
      }),
    );

    wrapper = mount(ActivityFeedCard);
    await flushPromises();
  });

  it('calls fetchActivities on mount', async () => {
    const fetchActivitiesSpy = vi.spyOn(store, 'fetchActivities');
    await wrapper.vm.$nextTick();
    expect(fetchActivitiesSpy).toHaveBeenCalled();
  });


  it('handles filter application', async () => {
    const sidebar = wrapper.findComponent(ActivityFeedSidebar);
    const filter = {
      id: '1', name: 'Open Defects', icon: 'pi-exclamation-circle', query: 'status:OPEN type:DEFECT'
    };

    await sidebar.vm.$emit('filter-applied', filter);
    await wrapper.vm.$nextTick();

    expect(store.filterIssueStatus).toContain('OPEN');
    expect(store.filterIssueType).toContain('DEFECT');
  });

  it('handles search query updates', async () => {
    const toolbar = wrapper.findComponent(ActivityFeedToolbar);
    await toolbar.vm.$emit('update:searchQuery', 'test query');

    expect(store.searchQuery).toBe('test query');
  });

  it('handles tab changes', async () => {
    const toolbar = wrapper.findComponent(ActivityFeedToolbar);
    await toolbar.vm.$emit('update:activeTab', 'unread');

    expect(store.activeTab).toBe('unread');
  });

  it('handles entry selection', async () => {
    store.entries = mockEntries.map(e => ({ ...e }));
    const entryList = wrapper.findComponent(ActivityFeedList);
    await entryList.vm.$emit('select-item', mockEntries[0]);
    await wrapper.vm.$nextTick();

    expect(store.selectedEntries.some(e => e.id === mockEntries[0].id)).toBe(true);
  });

  it('handles mark as read for selected entries', async () => {
    store.entries = mockEntries.map(e => ({ ...e }));
    const entryToMark = { ...mockEntries[0] };
    store.selectedEntries = [entryToMark];
    const toolbar = wrapper.findComponent(ActivityFeedToolbar);

    server.use(
      http.patch('/api/v1/activities/:activityId/status', () => {
        return HttpResponse.json({});
      }),
    );

    await toolbar.vm.$emit('mark-read-selected');
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    expect(store.selectedEntries).toHaveLength(0);
  });

  it('handles delete for selected entries', async () => {
    store.entries = mockEntries.map(e => ({ ...e }));
    const entryToDelete = { ...mockEntries[0] };
    store.selectedEntries = [entryToDelete];
    const toolbar = wrapper.findComponent(ActivityFeedToolbar);

    server.use(
      http.delete('/api/v1/activities/:activityId', () => {
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await toolbar.vm.$emit('delete-selected');
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    expect(store.selectedEntries).toHaveLength(0);
  });

  it('handles navigation to issue', async () => {
    const entryList = wrapper.findComponent(ActivityFeedList);
    await entryList.vm.$emit('navigate', mockEntries[0]);

    expect(mockPush).toHaveBeenCalled();
  });

  it('marks entry as read when navigating to an unread entry', async () => {
    store.entries = mockEntries.map(e => ({ ...e }));
    const markAsReadSpy = vi.spyOn(store, 'markAsRead');
    const entryList = wrapper.findComponent(ActivityFeedList);

    await entryList.vm.$emit('navigate', mockEntries[0]);

    expect(markAsReadSpy).toHaveBeenCalledWith(mockEntries[0]);
  });

  it('does not mark entry as read when navigating to an already read entry', async () => {
    store.entries = mockEntries.map(e => ({ ...e }));
    const markAsReadSpy = vi.spyOn(store, 'markAsRead');
    const entryList = wrapper.findComponent(ActivityFeedList);

    await entryList.vm.$emit('navigate', mockEntries[1]);

    expect(markAsReadSpy).not.toHaveBeenCalled();
  });

  it('toggles a filter off and clears filters when the same filter is applied twice', async () => {
    const sidebar = wrapper.findComponent(ActivityFeedSidebar);
    const filter = {
      id: 'toggle-filter', name: 'Toggle Filter', icon: 'pi-cog', query: 'status:OPEN'
    };

    await sidebar.vm.$emit('filter-applied', filter);
    expect(store.filterIssueStatus).toContain('OPEN');

    await sidebar.vm.$emit('filter-applied', filter);
    expect(store.filterIssueStatus).toHaveLength(0);
  });

  it('clears filters when sidebar emits clearFilters', async () => {
    const sidebar = wrapper.findComponent(ActivityFeedSidebar);
    store.filterProject = ['proj-1'];

    await sidebar.vm.$emit('clear-filters');

    expect(store.filterProject).toHaveLength(0);
  });

  it('ignores invalid tab change values', async () => {
    const toolbar = wrapper.findComponent(ActivityFeedToolbar);
    store.activeTab = 'all';

    await toolbar.vm.$emit('update:activeTab', 'invalid');

    expect(store.activeTab).toBe('all');
  });

  it('activates a project filter when it is not yet active', async () => {
    const sidebar = wrapper.findComponent(ActivityFeedSidebar);
    store.filterProject = [];

    await sidebar.vm.$emit('project-filter-toggled', 'proj-1');

    expect(store.filterProject).toEqual(['proj-1']);
  });

  it('clears the project filter when the active project is toggled again', async () => {
    const sidebar = wrapper.findComponent(ActivityFeedSidebar);
    store.filterProject = ['proj-1'];

    await sidebar.vm.$emit('project-filter-toggled', 'proj-1');

    expect(store.filterProject).toEqual([]);
  });

  it('deselects an already selected entry', async () => {
    store.entries = mockEntries.map(e => ({ ...e }));
    store.selectedEntries = [mockEntries[0]];
    const entryList = wrapper.findComponent(ActivityFeedList);

    await entryList.vm.$emit('select-item', mockEntries[0]);

    expect(store.selectedEntries.some(e => e.id === mockEntries[0].id)).toBe(false);
  });

  it('selects all displayed entries when not all are selected', async () => {
    store.entries = mockEntries.map(e => ({ ...e }));
    store.selectedEntries = [];
    const entryList = wrapper.findComponent(ActivityFeedList);

    await entryList.vm.$emit('select-all');

    expect(store.selectedEntries).toHaveLength(mockEntries.length);
  });

  it('deselects all entries when all are already selected', async () => {
    store.entries = mockEntries.map(e => ({ ...e }));
    store.selectedEntries = [...mockEntries];
    const entryList = wrapper.findComponent(ActivityFeedList);

    await entryList.vm.$emit('select-all');

    expect(store.selectedEntries).toHaveLength(0);
  });

  it('marks a single entry as read via the entry item action', async () => {
    store.entries = mockEntries.map(e => ({ ...e }));
    const markAsReadSpy = vi.spyOn(store, 'markAsRead');
    const entryList = wrapper.findComponent(ActivityFeedList);

    await entryList.vm.$emit('mark-read', mockEntries[0]);

    expect(markAsReadSpy).toHaveBeenCalledWith(mockEntries[0]);
  });

  it('deletes a single entry via the entry item action', async () => {
    store.entries = mockEntries.map(e => ({ ...e }));
    const confirmDeleteSpy = vi.spyOn(store, 'confirmDeleteSelected').mockImplementation(async () => {});
    const entryList = wrapper.findComponent(ActivityFeedList);

    await entryList.vm.$emit('delete', mockEntries[0]);

    expect(store.selectedEntries).toEqual([mockEntries[0]]);
    expect(confirmDeleteSpy).toHaveBeenCalled();
  });

  it('triggers loadMoreActivities when the entry list emits loadMore', async () => {
    const loadMoreSpy = vi.spyOn(store, 'loadMoreActivities').mockImplementation(async () => {});
    const entryList = wrapper.findComponent(ActivityFeedList);

    await entryList.vm.$emit('loadMore');

    expect(loadMoreSpy).toHaveBeenCalled();
  });

  it('sorts unread entries before read entries, newest first within each group', async () => {
    const unreadEarly = createMockActivityFeedEntry({
      id: 'u-early', read: false, createdAt: new Date('2025-01-01T00:00:00Z')
    });
    const readEarly = createMockActivityFeedEntry({
      id: 'r-early', read: true, createdAt: new Date('2025-01-02T00:00:00Z')
    });
    const unreadLate = createMockActivityFeedEntry({
      id: 'u-late', read: false, createdAt: new Date('2025-01-10T00:00:00Z')
    });
    const readLate = createMockActivityFeedEntry({
      id: 'r-late', read: true, createdAt: new Date('2025-01-11T00:00:00Z')
    });

    store.entries = [readEarly, unreadLate, readLate, unreadEarly];
    await wrapper.vm.$nextTick();

    const entryList = wrapper.findComponent(ActivityFeedList);
    const displayed = entryList.props('entries') as ActivityFeedEntry[];

    expect(displayed.map(e => e.id)).toEqual(['u-late', 'u-early', 'r-late', 'r-early']);
  });
});
