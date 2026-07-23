import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import InboxMessageList from '@/features/manager/inbox/components/InboxMessageList.vue';
import InboxEmptyState from '@/features/manager/inbox/components/InboxEmptyState.vue';
import InboxMessageItem from '@/features/manager/inbox/components/InboxMessageItem.vue';
import type { InboxMessage } from '@/features/manager/inbox/services/InboxService';
import { createMockInboxMessage, createGroupingTestMessages } from '../../../../utils/testHelpers';
import { useLayout } from '@/layouts/composables/layout';

describe('InboxMessageList', () => {
  let wrapper: VueWrapper;

  const mockMessages: InboxMessage[] = [
    createMockInboxMessage({
      id: '1',
      receivedAt: new Date('2025-01-10T10:00:00Z'),
      isRead: false,
      issueId: 'issue-101',
      issueTitle: 'Test Issue 1',
      issueType: 'DEFECT',
      issueStatus: 'OPEN',
      projectId: 'proj-1',
      projectName: 'Project 1',
    }),
    createMockInboxMessage({
      id: '2',
      receivedAt: new Date('2025-01-11T10:00:00Z'),
      isRead: true,
      issueId: 'issue-102',
      issueTitle: 'Test Issue 2',
      issueType: 'TASK',
      issueStatus: 'CLOSED',
      projectId: 'proj-2',
      projectName: 'Project 2',
    }),
  ];

  const mountWithProps = (overrides?: Partial<{
    messages: InboxMessage[];
    selectedMessages: InboxMessage[];
    searchQuery: string;
    grouping: 'date' | 'project' | null;
  }>) => {
    wrapper = mount(InboxMessageList, {
      props: {
        messages: overrides?.messages ?? mockMessages,
        selectedMessages: overrides?.selectedMessages ?? [],
        searchQuery: overrides?.searchQuery ?? '',
        grouping: overrides?.grouping ?? null,
      },
    });
    return wrapper;
  };

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('shows empty state when messages array is empty', () => {
    mountWithProps({ messages: [] });
    const emptyState = wrapper.findComponent(InboxEmptyState);
    expect(emptyState.props('hasSearchQuery')).toBe(false);
  });

  it('passes hasSearchQuery prop to EmptyState correctly', () => {
    mountWithProps({ messages: [], searchQuery: 'test query' });
    const emptyState = wrapper.findComponent(InboxEmptyState);
    expect(emptyState.props('hasSearchQuery')).toBe(true);
  });

  it('passes correct props to InboxMessageItem', () => {
    mountWithProps({});
    const firstItem = wrapper.findAllComponents(InboxMessageItem)[0];
    expect(firstItem.props('message')).toEqual(mockMessages[0]);
    expect(firstItem.props('isSelected')).toBe(false);
    expect(firstItem.props('index')).toBe(0);
    expect(firstItem.props('isLast')).toBe(false);
  });

  it('marks last item correctly', () => {
    mountWithProps({});
    const items = wrapper.findAllComponents(InboxMessageItem);
    expect(items[0].props('isLast')).toBe(false);
    expect(items[1].props('isLast')).toBe(true);
  });

  it('shows select all checkbox as checked when all messages are selected', () => {
    mountWithProps({ selectedMessages: mockMessages });
    const checkbox = wrapper.findComponent({ name: 'Checkbox' });
    expect(checkbox.props('modelValue')).toBe(true);
  });

  it('shows select all checkbox as unchecked when not all messages are selected', () => {
    mountWithProps({ selectedMessages: [mockMessages[0]] });

    const checkbox = wrapper.findComponent({ name: 'Checkbox' });
    expect(checkbox.props('modelValue')).toBe(false);
  });

  it('emits selectAll event when select all checkbox is clicked', async () => {
    mountWithProps({});
    const checkbox = wrapper.findComponent({ name: 'Checkbox' });
    await checkbox.vm.$emit('change');
    expect(wrapper.emitted('selectAll')).toBeTruthy();
  });

  it('emits selectItem event when message item checkbox is clicked', async () => {
    mountWithProps({});
    const firstItem = wrapper.findAllComponents(InboxMessageItem)[0];
    await firstItem.vm.$emit('select');
    expect(wrapper.emitted('selectItem')).toBeTruthy();
    expect(wrapper.emitted('selectItem')?.[0]).toEqual([mockMessages[0]]);
  });

  it('emits navigate event when message item is clicked', async () => {
    mountWithProps({});
    const firstItem = wrapper.findAllComponents(InboxMessageItem)[0];
    await firstItem.vm.$emit('navigate');
    expect(wrapper.emitted('navigate')).toBeTruthy();
    expect(wrapper.emitted('navigate')?.[0]).toEqual([mockMessages[0]]);
  });

  it('emits markRead event when message item markRead is triggered', async () => {
    mountWithProps({});
    const firstItem = wrapper.findAllComponents(InboxMessageItem)[0];
    await firstItem.vm.$emit('markRead');
    expect(wrapper.emitted('markRead')).toBeTruthy();
    expect(wrapper.emitted('markRead')?.[0]).toEqual([mockMessages[0]]);
  });

  it('emits delete event when message item delete is triggered', async () => {
    mountWithProps({});
    const firstItem = wrapper.findAllComponents(InboxMessageItem)[0];
    await firstItem.vm.$emit('delete');
    expect(wrapper.emitted('delete')).toBeTruthy();
    expect(wrapper.emitted('delete')?.[0]).toEqual([mockMessages[0]]);
  });

  it('correctly identifies selected messages', () => {
    mountWithProps({ selectedMessages: [mockMessages[0]] });
    const items = wrapper.findAllComponents(InboxMessageItem);
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

  it('forwards select/navigate/markRead/delete events for grouped message items', async () => {
    const messages = createGroupingTestMessages().slice(0, 2);
    mountWithProps({ messages, grouping: 'project' });

    const items = wrapper.findAllComponents(InboxMessageItem);
    const target = items.find(item => item.props('message').id === messages[0].id);
    expect(target).toBeTruthy();

    await target!.vm.$emit('select');
    expect(wrapper.emitted('selectItem')?.at(-1)).toEqual([messages[0]]);

    await target!.vm.$emit('navigate');
    expect(wrapper.emitted('navigate')?.at(-1)).toEqual([messages[0]]);

    await target!.vm.$emit('markRead');
    expect(wrapper.emitted('markRead')?.at(-1)).toEqual([messages[0]]);

    await target!.vm.$emit('delete');
    expect(wrapper.emitted('delete')?.at(-1)).toEqual([messages[0]]);
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

    it('returns null when messages array is empty with grouping', () => {
      mountWithProps({ messages: [], grouping: 'project' });
      const emptyState = wrapper.findComponent(InboxEmptyState);
      expect(emptyState.exists()).toBe(true);
    });

    it('groups messages by project', () => {
      const messagesWithMultipleProjects = createGroupingTestMessages();
      mountWithProps({ messages: messagesWithMultipleProjects, grouping: 'project' });

      const groupHeaders = wrapper.findAll('.px-4.py-2.bg-surface-100');
      expect(groupHeaders.length).toBeGreaterThan(0);
    });

    it('groups messages by date with today', () => {
      const today = new Date('2025-01-15T12:00:00Z');
      const messagesToday = [createMockInboxMessage({ receivedAt: today })];
      mountWithProps({ messages: messagesToday, grouping: 'date' });

      const groupHeaders = wrapper.findAll('.px-4.py-2.bg-surface-100');
      expect(groupHeaders.length).toBeGreaterThan(0);
    });

    it('groups messages by date with yesterday', () => {
      const yesterday = new Date('2025-01-14T12:00:00Z');
      const messagesYesterday = [createMockInboxMessage({ receivedAt: yesterday })];
      mountWithProps({ messages: messagesYesterday, grouping: 'date' });

      const groupHeaders = wrapper.findAll('.px-4.py-2.bg-surface-100');
      expect(groupHeaders.length).toBeGreaterThan(0);
    });

    it('groups messages by date with week ago', () => {
      const weekAgo = new Date('2025-01-10T12:00:00Z');
      const messagesWeekAgo = [createMockInboxMessage({ receivedAt: weekAgo })];
      mountWithProps({ messages: messagesWeekAgo, grouping: 'date' });

      const groupHeaders = wrapper.findAll('.px-4.py-2.bg-surface-100');
      expect(groupHeaders.length).toBeGreaterThan(0);
    });

    it('groups messages by date with month ago', () => {
      const monthAgo = new Date('2024-12-15T12:00:00Z');
      const messagesMonthAgo = [createMockInboxMessage({ receivedAt: monthAgo })];
      mountWithProps({ messages: messagesMonthAgo, grouping: 'date' });

      const groupHeaders = wrapper.findAll('.px-4.py-2.bg-surface-100');
      expect(groupHeaders.length).toBeGreaterThan(0);
    });

    it('sorts multiple date groups: today, yesterday, week-ago and month-ago', () => {
      const today = createMockInboxMessage({ id: 't1', receivedAt: new Date('2025-01-15T09:00:00Z') });
      const yesterday = createMockInboxMessage({ id: 'y1', receivedAt: new Date('2025-01-14T09:00:00Z') });
      const weekAgo = createMockInboxMessage({ id: 'w1', receivedAt: new Date('2025-01-10T09:00:00Z') });
      const monthAgo = createMockInboxMessage({ id: 'm1', receivedAt: new Date('2024-12-15T09:00:00Z') });

      mountWithProps({ messages: [monthAgo, weekAgo, yesterday, today], grouping: 'date' });

      const groupHeaders = wrapper.findAll('.px-4.py-2.bg-surface-100');
      expect(groupHeaders.length).toBe(4);
    });

    it('handles selected messages with project grouping', () => {
      const messagesWithMultipleProjects = createGroupingTestMessages().slice(0, 2);
      mountWithProps({
        messages: messagesWithMultipleProjects,
        selectedMessages: [messagesWithMultipleProjects[0]],
        grouping: 'project',
      });

      const items = wrapper.findAllComponents(InboxMessageItem);
      expect(items.length).toBeGreaterThan(0);
      expect(items[0].props('isSelected')).toBe(true);
    });
  });
});

