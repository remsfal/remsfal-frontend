import { describe, it, expect, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import InboxMessageList from '../../../src/components/inbox/InboxMessageList.vue';
import InboxEmptyState from '../../../src/components/inbox/InboxEmptyState.vue';
import InboxMessageItem from '../../../src/components/inbox/InboxMessageItem.vue';
import type { InboxMessage } from '../../../src/services/InboxService';

describe('InboxMessageList', () => {
  let wrapper: VueWrapper;

  const mockMessages: InboxMessage[] = [
    {
      id: '1',
      receivedAt: new Date('2025-01-10T10:00:00Z'),
      isRead: false,
      issueId: 'issue-101',
      issueTitle: 'Test Issue 1',
      issueType: 'DEFECT',
      issueStatus: 'OPEN',
      projectId: 'proj-1',
      projectName: 'Project 1',
    },
    {
      id: '2',
      receivedAt: new Date('2025-01-11T10:00:00Z'),
      isRead: true,
      issueId: 'issue-102',
      issueTitle: 'Test Issue 2',
      issueType: 'TASK',
      issueStatus: 'CLOSED',
      projectId: 'proj-2',
      projectName: 'Project 2',
    },
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
});

