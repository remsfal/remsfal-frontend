import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import InboxMessageList from '../../../src/components/inbox/InboxMessageList.vue';
import InboxEmptyState from '../../../src/components/inbox/InboxEmptyState.vue';
import InboxMessageItem from '../../../src/components/inbox/InboxMessageItem.vue';
import type { InboxMessage } from '../../../src/services/InboxService';
import { createMockInboxMessage } from '../../utils/testHelpers';

describe('InboxMessageList', () => {
  let wrapper: VueWrapper;

  const mockMessages: InboxMessage[] = [
    createMockInboxMessage({ id: '1', receivedAt: new Date('2025-01-10T10:00:00Z'), isRead: false, issueId: 'issue-101', issueTitle: 'Test Issue 1', issueType: 'DEFECT', issueStatus: 'OPEN', projectId: 'proj-1', projectName: 'Project 1' }),
    createMockInboxMessage({ id: '2', receivedAt: new Date('2025-01-11T10:00:00Z'), isRead: true, issueId: 'issue-102', issueTitle: 'Test Issue 2', issueType: 'TASK', issueStatus: 'CLOSED', projectId: 'proj-2', projectName: 'Project 2' }),
  ];

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('shows empty state when messages array is empty', () => {
    wrapper = mount(InboxMessageList, {
      props: {
        messages: [],
        selectedMessages: [],
        searchQuery: '',
        grouping: null,
      },
    });

    const emptyState = wrapper.findComponent(InboxEmptyState);
    expect(emptyState.props('hasSearchQuery')).toBe(false);
  });

  it('passes hasSearchQuery prop to EmptyState correctly', () => {
    wrapper = mount(InboxMessageList, {
      props: {
        messages: [],
        selectedMessages: [],
        searchQuery: 'test query',
        grouping: null,
      },
    });

    const emptyState = wrapper.findComponent(InboxEmptyState);
    expect(emptyState.props('hasSearchQuery')).toBe(true);
  });

  it('passes correct props to InboxMessageItem', () => {
    wrapper = mount(InboxMessageList, {
      props: {
        messages: mockMessages,
        selectedMessages: [],
        searchQuery: '',
        grouping: null,
      },
    });

    const firstItem = wrapper.findAllComponents(InboxMessageItem)[0];
    expect(firstItem.props('message')).toEqual(mockMessages[0]);
    expect(firstItem.props('isSelected')).toBe(false);
    expect(firstItem.props('index')).toBe(0);
    expect(firstItem.props('isLast')).toBe(false);
  });

  it('marks last item correctly', () => {
    wrapper = mount(InboxMessageList, {
      props: {
        messages: mockMessages,
        selectedMessages: [],
        searchQuery: '',
        grouping: null,
      },
    });

    const items = wrapper.findAllComponents(InboxMessageItem);
    expect(items[0].props('isLast')).toBe(false);
    expect(items[1].props('isLast')).toBe(true);
  });

  it('shows select all checkbox as checked when all messages are selected', () => {
    wrapper = mount(InboxMessageList, {
      props: {
        messages: mockMessages,
        selectedMessages: mockMessages,
        searchQuery: '',
        grouping: null,
      },
    });

    const checkbox = wrapper.findComponent({ name: 'Checkbox' });
    expect(checkbox.props('modelValue')).toBe(true);
  });

  it('shows select all checkbox as unchecked when not all messages are selected', () => {
    wrapper = mount(InboxMessageList, {
      props: {
        messages: mockMessages,
        selectedMessages: [mockMessages[0]],
        searchQuery: '',
        grouping: null,
      },
    });

    const checkbox = wrapper.findComponent({ name: 'Checkbox' });
    expect(checkbox.props('modelValue')).toBe(false);
  });

  it('emits select-all event when select all checkbox is clicked', async () => {
    wrapper = mount(InboxMessageList, {
      props: {
        messages: mockMessages,
        selectedMessages: [],
        searchQuery: '',
        grouping: null,
      },
    });

    const checkbox = wrapper.findComponent({ name: 'Checkbox' });
    await checkbox.vm.$emit('change');
    
    expect(wrapper.emitted('selectAll')).toBeTruthy();
  });

  it('emits select-item event when message item checkbox is clicked', async () => {
    wrapper = mount(InboxMessageList, {
      props: {
        messages: mockMessages,
        selectedMessages: [],
        searchQuery: '',
        grouping: null,
      },
    });

    const firstItem = wrapper.findAllComponents(InboxMessageItem)[0];
    await firstItem.vm.$emit('select');
    
    expect(wrapper.emitted('selectItem')).toBeTruthy();
    expect(wrapper.emitted('selectItem')?.[0]).toEqual([mockMessages[0]]);
  });

  it('emits navigate event when message item is clicked', async () => {
    wrapper = mount(InboxMessageList, {
      props: {
        messages: mockMessages,
        selectedMessages: [],
        searchQuery: '',
        grouping: null,
      },
    });

    const firstItem = wrapper.findAllComponents(InboxMessageItem)[0];
    await firstItem.vm.$emit('navigate');
    
    expect(wrapper.emitted('navigate')).toBeTruthy();
    expect(wrapper.emitted('navigate')?.[0]).toEqual([mockMessages[0]]);
  });

  it('emits mark-read event when message item mark-read is triggered', async () => {
    wrapper = mount(InboxMessageList, {
      props: {
        messages: mockMessages,
        selectedMessages: [],
        searchQuery: '',
        grouping: null,
      },
    });

    const firstItem = wrapper.findAllComponents(InboxMessageItem)[0];
    await firstItem.vm.$emit('markRead');

    expect(wrapper.emitted('markRead')).toBeTruthy();
    expect(wrapper.emitted('markRead')?.[0]).toEqual([mockMessages[0]]);
  });

  it('emits delete event when message item delete is triggered', async () => {
    wrapper = mount(InboxMessageList, {
      props: {
        messages: mockMessages,
        selectedMessages: [],
        searchQuery: '',
        grouping: null,
      },
    });

    const firstItem = wrapper.findAllComponents(InboxMessageItem)[0];
    await firstItem.vm.$emit('delete');
    
    expect(wrapper.emitted('delete')).toBeTruthy();
    expect(wrapper.emitted('delete')?.[0]).toEqual([mockMessages[0]]);
  });

  it('correctly identifies selected messages', () => {
    wrapper = mount(InboxMessageList, {
      props: {
        messages: mockMessages,
        selectedMessages: [mockMessages[0]],
        searchQuery: '',
        grouping: null,
      },
    });

    const items = wrapper.findAllComponents(InboxMessageItem);
    expect(items[0].props('isSelected')).toBe(true);
    expect(items[1].props('isSelected')).toBe(false);
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
      wrapper = mount(InboxMessageList, {
        props: {
          messages: mockMessages,
          selectedMessages: [],
          searchQuery: '',
          grouping: null,
        },
      });

      const dataView = wrapper.findComponent({ name: 'DataView' });
      expect(dataView.exists()).toBe(true);
    });

    it('returns null when messages array is empty with grouping', () => {
      wrapper = mount(InboxMessageList, {
        props: {
          messages: [],
          selectedMessages: [],
          searchQuery: '',
          grouping: 'project',
        },
      });

      const emptyState = wrapper.findComponent(InboxEmptyState);
      expect(emptyState.exists()).toBe(true);
    });

    it('groups messages by project', () => {
      const messagesWithMultipleProjects: InboxMessage[] = [
        createMockInboxMessage({ id: '1', receivedAt: new Date('2025-01-10T10:00:00Z'), isRead: false, issueId: 'issue-101', issueTitle: 'Test Issue 1', issueType: 'DEFECT', issueStatus: 'OPEN', projectId: 'proj-1', projectName: 'Project 1' }),
        createMockInboxMessage({ id: '2', receivedAt: new Date('2025-01-11T10:00:00Z'), isRead: true, issueId: 'issue-102', issueTitle: 'Test Issue 2', issueType: 'TASK', issueStatus: 'CLOSED', projectId: 'proj-2', projectName: 'Project 2' }),
        createMockInboxMessage({ id: '3', receivedAt: new Date('2025-01-12T10:00:00Z'), isRead: false, issueId: 'issue-103', issueTitle: 'Test Issue 3', issueType: 'DEFECT', issueStatus: 'OPEN', projectId: 'proj-1', projectName: 'Project 1' }),
      ];

      wrapper = mount(InboxMessageList, {
        props: {
          messages: messagesWithMultipleProjects,
          selectedMessages: [],
          searchQuery: '',
          grouping: 'project',
        },
      });

      const groupHeaders = wrapper.findAll('.px-4.py-2.bg-surface-100');
      expect(groupHeaders.length).toBeGreaterThan(0);
    });

    it('groups messages by date with today', () => {
      const today = new Date('2025-01-15T12:00:00Z');
      const messagesToday: InboxMessage[] = [
        createMockInboxMessage({ id: '1', receivedAt: today, isRead: false, issueId: 'issue-101', issueTitle: 'Test Issue 1', issueType: 'DEFECT', issueStatus: 'OPEN', projectId: 'proj-1', projectName: 'Project 1' }),
      ];

      wrapper = mount(InboxMessageList, {
        props: {
          messages: messagesToday,
          selectedMessages: [],
          searchQuery: '',
          grouping: 'date',
        },
      });

      const groupHeaders = wrapper.findAll('.px-4.py-2.bg-surface-100');
      expect(groupHeaders.length).toBeGreaterThan(0);
    });

    it('groups messages by date with yesterday', () => {
      const yesterday = new Date('2025-01-14T12:00:00Z');
      const messagesYesterday: InboxMessage[] = [
        createMockInboxMessage({ id: '1', receivedAt: yesterday, isRead: false, issueId: 'issue-101', issueTitle: 'Test Issue 1', issueType: 'DEFECT', issueStatus: 'OPEN', projectId: 'proj-1', projectName: 'Project 1' }),
      ];

      wrapper = mount(InboxMessageList, {
        props: {
          messages: messagesYesterday,
          selectedMessages: [],
          searchQuery: '',
          grouping: 'date',
        },
      });

      const groupHeaders = wrapper.findAll('.px-4.py-2.bg-surface-100');
      expect(groupHeaders.length).toBeGreaterThan(0);
    });

    it('groups messages by date with week ago', () => {
      const weekAgo = new Date('2025-01-10T12:00:00Z');
      const messagesWeekAgo: InboxMessage[] = [
        createMockInboxMessage({ id: '1', receivedAt: weekAgo, isRead: false, issueId: 'issue-101', issueTitle: 'Test Issue 1', issueType: 'DEFECT', issueStatus: 'OPEN', projectId: 'proj-1', projectName: 'Project 1' }),
      ];

      wrapper = mount(InboxMessageList, {
        props: {
          messages: messagesWeekAgo,
          selectedMessages: [],
          searchQuery: '',
          grouping: 'date',
        },
      });

      const groupHeaders = wrapper.findAll('.px-4.py-2.bg-surface-100');
      expect(groupHeaders.length).toBeGreaterThan(0);
    });

    it('groups messages by date with month ago', () => {
      const monthAgo = new Date('2024-12-15T12:00:00Z');
      const messagesMonthAgo: InboxMessage[] = [
        createMockInboxMessage({ id: '1', receivedAt: monthAgo, isRead: false, issueId: 'issue-101', issueTitle: 'Test Issue 1', issueType: 'DEFECT', issueStatus: 'OPEN', projectId: 'proj-1', projectName: 'Project 1' }),
      ];

      wrapper = mount(InboxMessageList, {
        props: {
          messages: messagesMonthAgo,
          selectedMessages: [],
          searchQuery: '',
          grouping: 'date',
        },
      });

      const groupHeaders = wrapper.findAll('.px-4.py-2.bg-surface-100');
      expect(groupHeaders.length).toBeGreaterThan(0);
    });

    it('handles selected messages with project grouping', () => {
      const messagesWithMultipleProjects: InboxMessage[] = [
        createMockInboxMessage({ id: '1', receivedAt: new Date('2025-01-10T10:00:00Z'), isRead: false, issueId: 'issue-101', issueTitle: 'Test Issue 1', issueType: 'DEFECT', issueStatus: 'OPEN', projectId: 'proj-1', projectName: 'Project 1' }),
        createMockInboxMessage({ id: '2', receivedAt: new Date('2025-01-11T10:00:00Z'), isRead: true, issueId: 'issue-102', issueTitle: 'Test Issue 2', issueType: 'TASK', issueStatus: 'CLOSED', projectId: 'proj-2', projectName: 'Project 2' }),
      ];

      wrapper = mount(InboxMessageList, {
        props: {
          messages: messagesWithMultipleProjects,
          selectedMessages: [messagesWithMultipleProjects[0]],
          searchQuery: '',
          grouping: 'project',
        },
      });

      const items = wrapper.findAllComponents(InboxMessageItem);
      expect(items.length).toBeGreaterThan(0);
      expect(items[0].props('isSelected')).toBe(true);
    });
  });
});

