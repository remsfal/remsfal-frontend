import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import ActivityFeedList from '@/features/manager/activityFeeds/components/ActivityFeedList.vue';
import ActivityFeedEmptyState from '@/features/manager/activityFeeds/components/ActivityFeedEmptyState.vue';
import ActivityFeedItem from '@/features/manager/activityFeeds/components/ActivityFeedItem.vue';
import type { ActivityFeedEntry } from '@/features/manager/activityFeeds/stores/ActivityFeedStore';
import { createMockActivityFeedEntry, createGroupingTestActivityFeedEntries } from '../../../../utils/testHelpers';
import { useLayout } from '@/layouts/composables/layout';

describe('ActivityFeedList', () => {
  let wrapper: VueWrapper;

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

  const mountWithProps = (overrides?: Partial<{
    entries: ActivityFeedEntry[];
    selectedEntries: ActivityFeedEntry[];
    searchQuery: string;
    grouping: 'date' | 'project' | null;
    hasMore: boolean;
    isLoadingMore: boolean;
  }>) => {
    wrapper = mount(ActivityFeedList, {
      props: {
        entries: overrides?.entries ?? mockEntries,
        selectedEntries: overrides?.selectedEntries ?? [],
        searchQuery: overrides?.searchQuery ?? '',
        grouping: overrides?.grouping ?? null,
        hasMore: overrides?.hasMore ?? false,
        isLoadingMore: overrides?.isLoadingMore ?? false,
      },
    });
    return wrapper;
  };

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('shows empty state when entries array is empty', () => {
    mountWithProps({ entries: [] });
    const emptyState = wrapper.findComponent(ActivityFeedEmptyState);
    expect(emptyState.props('hasSearchQuery')).toBe(false);
  });

  it('passes hasSearchQuery prop to EmptyState correctly', () => {
    mountWithProps({ entries: [], searchQuery: 'test query' });
    const emptyState = wrapper.findComponent(ActivityFeedEmptyState);
    expect(emptyState.props('hasSearchQuery')).toBe(true);
  });

  it('passes correct props to ActivityFeedItem', () => {
    mountWithProps({});
    const firstItem = wrapper.findAllComponents(ActivityFeedItem)[0];
    expect(firstItem.props('entry')).toEqual(mockEntries[0]);
    expect(firstItem.props('isSelected')).toBe(false);
    expect(firstItem.props('index')).toBe(0);
    expect(firstItem.props('isLast')).toBe(false);
  });

  it('marks last item correctly', () => {
    mountWithProps({});
    const items = wrapper.findAllComponents(ActivityFeedItem);
    expect(items[0].props('isLast')).toBe(false);
    expect(items[1].props('isLast')).toBe(true);
  });

  it('shows select all checkbox as checked when all entries are selected', () => {
    mountWithProps({ selectedEntries: mockEntries });
    const checkbox = wrapper.findComponent({ name: 'Checkbox' });
    expect(checkbox.props('modelValue')).toBe(true);
  });

  it('shows select all checkbox as unchecked when not all entries are selected', () => {
    mountWithProps({ selectedEntries: [mockEntries[0]] });

    const checkbox = wrapper.findComponent({ name: 'Checkbox' });
    expect(checkbox.props('modelValue')).toBe(false);
  });

  it('emits selectAll event when select all checkbox is clicked', async () => {
    mountWithProps({});
    const checkbox = wrapper.findComponent({ name: 'Checkbox' });
    await checkbox.vm.$emit('change');
    expect(wrapper.emitted('selectAll')).toBeTruthy();
  });

  it('emits selectItem event when entry item checkbox is clicked', async () => {
    mountWithProps({});
    const firstItem = wrapper.findAllComponents(ActivityFeedItem)[0];
    await firstItem.vm.$emit('select');
    expect(wrapper.emitted('selectItem')).toBeTruthy();
    expect(wrapper.emitted('selectItem')?.[0]).toEqual([mockEntries[0]]);
  });

  it('emits navigate event when entry item is clicked', async () => {
    mountWithProps({});
    const firstItem = wrapper.findAllComponents(ActivityFeedItem)[0];
    await firstItem.vm.$emit('navigate');
    expect(wrapper.emitted('navigate')).toBeTruthy();
    expect(wrapper.emitted('navigate')?.[0]).toEqual([mockEntries[0]]);
  });

  it('emits markRead event when entry item markRead is triggered', async () => {
    mountWithProps({});
    const firstItem = wrapper.findAllComponents(ActivityFeedItem)[0];
    await firstItem.vm.$emit('markRead');
    expect(wrapper.emitted('markRead')).toBeTruthy();
    expect(wrapper.emitted('markRead')?.[0]).toEqual([mockEntries[0]]);
  });

  it('emits delete event when entry item delete is triggered', async () => {
    mountWithProps({});
    const firstItem = wrapper.findAllComponents(ActivityFeedItem)[0];
    await firstItem.vm.$emit('delete');
    expect(wrapper.emitted('delete')).toBeTruthy();
    expect(wrapper.emitted('delete')?.[0]).toEqual([mockEntries[0]]);
  });

  it('correctly identifies selected entries', () => {
    mountWithProps({ selectedEntries: [mockEntries[0]] });
    const items = wrapper.findAllComponents(ActivityFeedItem);
    expect(items[0].props('isSelected')).toBe(true);
    expect(items[1].props('isSelected')).toBe(false);
  });

  it('applies dark theme classes when dark mode is enabled', () => {
    const { layoutConfig } = useLayout();
    layoutConfig.darkTheme = true;
    try {
      mountWithProps({});
      expect(wrapper.html()).toContain('bg-surface-800/50');
    } finally {
      layoutConfig.darkTheme = false;
    }
  });

  it('forwards select/navigate/markRead/delete events for grouped entry items', async () => {
    const entries = createGroupingTestActivityFeedEntries().slice(0, 2);
    mountWithProps({ entries, grouping: 'project' });

    const items = wrapper.findAllComponents(ActivityFeedItem);
    const target = items.find(item => item.props('entry').id === entries[0].id);
    expect(target).toBeTruthy();

    await target!.vm.$emit('select');
    expect(wrapper.emitted('selectItem')?.at(-1)).toEqual([entries[0]]);

    await target!.vm.$emit('navigate');
    expect(wrapper.emitted('navigate')?.at(-1)).toEqual([entries[0]]);

    await target!.vm.$emit('markRead');
    expect(wrapper.emitted('markRead')?.at(-1)).toEqual([entries[0]]);

    await target!.vm.$emit('delete');
    expect(wrapper.emitted('delete')?.at(-1)).toEqual([entries[0]]);
  });

  describe('load more', () => {
    // The load more Button is the only one rendered by ActivityFeedList itself with a
    // `label` prop (ActivityFeedItem's buttons are icon-only), so it's identified that way
    // rather than by its (locale-dependent) translated text.
    const findLoadMoreButton = () => wrapper.findAllComponents({ name: 'Button' })
      .find(btn => !!btn.props('label'));

    it('does not render the load more control when hasMore is false', () => {
      mountWithProps({ hasMore: false });
      expect(findLoadMoreButton()).toBeUndefined();
    });

    it('renders the load more control when hasMore is true', () => {
      mountWithProps({ hasMore: true });
      expect(findLoadMoreButton()).toBeDefined();
    });

    it('emits loadMore when the load more button is clicked', async () => {
      mountWithProps({ hasMore: true });
      await findLoadMoreButton()!.trigger('click');
      expect(wrapper.emitted('loadMore')).toBeTruthy();
    });

    it('passes the loading state to the load more button', () => {
      mountWithProps({ hasMore: true, isLoadingMore: true });
      expect(findLoadMoreButton()?.props('loading')).toBe(true);
    });
  });

  describe('grouping functionality', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns null when grouping is null', () => {
      mountWithProps({});
      const dataView = wrapper.findComponent({ name: 'DataView' });
      expect(dataView.exists()).toBe(true);
    });

    it('returns null when entries array is empty with grouping', () => {
      mountWithProps({ entries: [], grouping: 'project' });
      const emptyState = wrapper.findComponent(ActivityFeedEmptyState);
      expect(emptyState.exists()).toBe(true);
    });

    it('groups entries by project', () => {
      const entriesWithMultipleProjects = createGroupingTestActivityFeedEntries();
      mountWithProps({ entries: entriesWithMultipleProjects, grouping: 'project' });

      const groupHeaders = wrapper.findAll('.px-4.py-2.bg-surface-100');
      expect(groupHeaders.length).toBeGreaterThan(0);
    });

    it('groups entries by date with today', () => {
      const today = new Date('2025-01-15T12:00:00Z');
      const entriesToday = [createMockActivityFeedEntry({ createdAt: today })];
      mountWithProps({ entries: entriesToday, grouping: 'date' });

      const groupHeaders = wrapper.findAll('.px-4.py-2.bg-surface-100');
      expect(groupHeaders.length).toBeGreaterThan(0);
    });

    it('groups entries by date with yesterday', () => {
      const yesterday = new Date('2025-01-14T12:00:00Z');
      const entriesYesterday = [createMockActivityFeedEntry({ createdAt: yesterday })];
      mountWithProps({ entries: entriesYesterday, grouping: 'date' });

      const groupHeaders = wrapper.findAll('.px-4.py-2.bg-surface-100');
      expect(groupHeaders.length).toBeGreaterThan(0);
    });

    it('groups entries by date with week ago', () => {
      const weekAgo = new Date('2025-01-10T12:00:00Z');
      const entriesWeekAgo = [createMockActivityFeedEntry({ createdAt: weekAgo })];
      mountWithProps({ entries: entriesWeekAgo, grouping: 'date' });

      const groupHeaders = wrapper.findAll('.px-4.py-2.bg-surface-100');
      expect(groupHeaders.length).toBeGreaterThan(0);
    });

    it('groups entries by date with month ago', () => {
      const monthAgo = new Date('2024-12-15T12:00:00Z');
      const entriesMonthAgo = [createMockActivityFeedEntry({ createdAt: monthAgo })];
      mountWithProps({ entries: entriesMonthAgo, grouping: 'date' });

      const groupHeaders = wrapper.findAll('.px-4.py-2.bg-surface-100');
      expect(groupHeaders.length).toBeGreaterThan(0);
    });

    it('sorts multiple date groups: today, yesterday, week-ago and month-ago', () => {
      const today = createMockActivityFeedEntry({ id: 't1', createdAt: new Date('2025-01-15T09:00:00Z') });
      const yesterday = createMockActivityFeedEntry({ id: 'y1', createdAt: new Date('2025-01-14T09:00:00Z') });
      const weekAgo = createMockActivityFeedEntry({ id: 'w1', createdAt: new Date('2025-01-10T09:00:00Z') });
      const monthAgo = createMockActivityFeedEntry({ id: 'm1', createdAt: new Date('2024-12-15T09:00:00Z') });

      mountWithProps({ entries: [monthAgo, weekAgo, yesterday, today], grouping: 'date' });

      const groupHeaders = wrapper.findAll('.px-4.py-2.bg-surface-100');
      expect(groupHeaders).toHaveLength(4);
    });

    it('handles selected entries with project grouping', () => {
      const entriesWithMultipleProjects = createGroupingTestActivityFeedEntries().slice(0, 2);
      mountWithProps({
        entries: entriesWithMultipleProjects,
        selectedEntries: [entriesWithMultipleProjects[0]],
        grouping: 'project',
      });

      const items = wrapper.findAllComponents(ActivityFeedItem);
      expect(items.length).toBeGreaterThan(0);
      expect(items[0].props('isSelected')).toBe(true);
    });
  });
});
