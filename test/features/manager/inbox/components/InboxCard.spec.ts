import { mount, VueWrapper } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../mocks/server';
import InboxCard from '@/features/manager/inbox/components/InboxCard.vue';
import { useInboxStore } from '@/features/manager/inbox/stores/InboxStore';
import InboxSidebar from '@/features/manager/inbox/components/InboxSidebar.vue';
import InboxToolbar from '@/features/manager/inbox/components/InboxToolbar.vue';
import InboxMessageList from '@/features/manager/inbox/components/InboxMessageList.vue';
import type { InboxMessage } from '@/features/manager/inbox/services/InboxService';
import { createMockInboxMessage } from '../../../../utils/testHelpers';

// Mocks
const mockPush = vi.fn();
vi.mock('vue-router', () => ({ useRouter: () => ({ push: mockPush }) }));

describe('InboxCard.vue', () => {
  let wrapper: VueWrapper;
  let store: ReturnType<typeof useInboxStore>;

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


  beforeEach(() => {
    store = useInboxStore();

    server.use(
      http.get('http://localhost:8080/notification/inbox', () => {
        return HttpResponse.json(mockMessages);
      }),
    );

    wrapper = mount(InboxCard);
  });

  it('calls fetchInbox on mount', async () => {
    const fetchInboxSpy = vi.spyOn(store, 'fetchInbox');
    await wrapper.vm.$nextTick();
    expect(fetchInboxSpy).toHaveBeenCalled();
  });


  it('handles filter application', async () => {
    const sidebar = wrapper.findComponent(InboxSidebar);
    const filter = {
      id: '1', name: 'Open Defects', icon: 'pi-exclamation-circle', query: 'status:OPEN type:DEFECT'
    };

    await sidebar.vm.$emit('filter-applied', filter);
    await wrapper.vm.$nextTick();

    expect(store.filterIssueStatus).toContain('OPEN');
    expect(store.filterIssueType).toContain('DEFECT');
  });

  it('handles search query updates', async () => {
    const toolbar = wrapper.findComponent(InboxToolbar);
    await toolbar.vm.$emit('update:searchQuery', 'test query');

    expect(store.searchQuery).toBe('test query');
  });

  it('handles tab changes', async () => {
    const toolbar = wrapper.findComponent(InboxToolbar);
    await toolbar.vm.$emit('update:activeTab', 'unread');

    expect(store.activeTab).toBe('unread');
  });

  it('handles message selection', async () => {
    store.messages = mockMessages.map(m => ({ ...m }));
    const messageList = wrapper.findComponent(InboxMessageList);
    await messageList.vm.$emit('select-item', mockMessages[0]);
    await wrapper.vm.$nextTick();

    expect(store.selectedMessages.some(m => m.id === mockMessages[0].id)).toBe(true);
  });

  it('handles mark as read for selected messages', async () => {
    store.messages = mockMessages.map(m => ({ ...m }));
    const messageToMark = { ...mockMessages[0] };
    store.selectedMessages = [messageToMark];
    const toolbar = wrapper.findComponent(InboxToolbar);

    server.use(
      http.patch('http://localhost:8080/notification/inbox/:messageId/read', () => {
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await toolbar.vm.$emit('mark-read-selected');
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    expect(store.selectedMessages).toHaveLength(0);
  });

  it('handles delete for selected messages', async () => {
    store.messages = mockMessages.map(m => ({ ...m }));
    const messageToDelete = { ...mockMessages[0] };
    store.selectedMessages = [messageToDelete];
    const toolbar = wrapper.findComponent(InboxToolbar);

    server.use(
      http.delete('http://localhost:8080/notification/inbox/:messageId', () => {
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await toolbar.vm.$emit('delete-selected');
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    expect(store.selectedMessages).toHaveLength(0);
  });

  it('handles navigation to issue', async () => {
    const messageList = wrapper.findComponent(InboxMessageList);
    await messageList.vm.$emit('navigate', mockMessages[0]);

    expect(mockPush).toHaveBeenCalled();
  });

  it('marks message as read when navigating to an unread message', async () => {
    store.messages = mockMessages.map(m => ({ ...m }));
    const markAsReadSpy = vi.spyOn(store, 'markAsRead');
    const messageList = wrapper.findComponent(InboxMessageList);

    await messageList.vm.$emit('navigate', mockMessages[0]);

    expect(markAsReadSpy).toHaveBeenCalledWith(mockMessages[0]);
  });

  it('does not mark message as read when navigating to an already read message', async () => {
    store.messages = mockMessages.map(m => ({ ...m }));
    const markAsReadSpy = vi.spyOn(store, 'markAsRead');
    const messageList = wrapper.findComponent(InboxMessageList);

    await messageList.vm.$emit('navigate', mockMessages[1]);

    expect(markAsReadSpy).not.toHaveBeenCalled();
  });

  it('toggles a filter off and clears filters when the same filter is applied twice', async () => {
    const sidebar = wrapper.findComponent(InboxSidebar);
    const filter = {
      id: 'toggle-filter', name: 'Toggle Filter', icon: 'pi-cog', query: 'status:OPEN'
    };

    await sidebar.vm.$emit('filter-applied', filter);
    expect(store.filterIssueStatus).toContain('OPEN');

    await sidebar.vm.$emit('filter-applied', filter);
    expect(store.filterIssueStatus).toHaveLength(0);
  });

  it('clears filters when sidebar emits clearFilters', async () => {
    const sidebar = wrapper.findComponent(InboxSidebar);
    store.filterProject = ['proj-1'];

    await sidebar.vm.$emit('clear-filters');

    expect(store.filterProject).toHaveLength(0);
  });

  it('ignores invalid tab change values', async () => {
    const toolbar = wrapper.findComponent(InboxToolbar);
    store.activeTab = 'all';

    await toolbar.vm.$emit('update:activeTab', 'invalid');

    expect(store.activeTab).toBe('all');
  });

  it('activates a project filter when it is not yet active', async () => {
    const sidebar = wrapper.findComponent(InboxSidebar);
    store.filterProject = [];

    await sidebar.vm.$emit('project-filter-toggled', 'proj-1');

    expect(store.filterProject).toEqual(['proj-1']);
  });

  it('clears the project filter when the active project is toggled again', async () => {
    const sidebar = wrapper.findComponent(InboxSidebar);
    store.filterProject = ['proj-1'];

    await sidebar.vm.$emit('project-filter-toggled', 'proj-1');

    expect(store.filterProject).toEqual([]);
  });

  it('deselects an already selected message', async () => {
    store.messages = mockMessages.map(m => ({ ...m }));
    store.selectedMessages = [mockMessages[0]];
    const messageList = wrapper.findComponent(InboxMessageList);

    await messageList.vm.$emit('select-item', mockMessages[0]);

    expect(store.selectedMessages.some(m => m.id === mockMessages[0].id)).toBe(false);
  });

  it('selects all displayed messages when not all are selected', async () => {
    store.messages = mockMessages.map(m => ({ ...m }));
    store.selectedMessages = [];
    const messageList = wrapper.findComponent(InboxMessageList);

    await messageList.vm.$emit('select-all');

    expect(store.selectedMessages).toHaveLength(mockMessages.length);
  });

  it('deselects all messages when all are already selected', async () => {
    store.messages = mockMessages.map(m => ({ ...m }));
    store.selectedMessages = [...mockMessages];
    const messageList = wrapper.findComponent(InboxMessageList);

    await messageList.vm.$emit('select-all');

    expect(store.selectedMessages).toHaveLength(0);
  });

  it('marks a single message as read via the message item action', async () => {
    store.messages = mockMessages.map(m => ({ ...m }));
    const markAsReadSpy = vi.spyOn(store, 'markAsRead');
    const messageList = wrapper.findComponent(InboxMessageList);

    await messageList.vm.$emit('mark-read', mockMessages[0]);

    expect(markAsReadSpy).toHaveBeenCalledWith(mockMessages[0]);
  });

  it('deletes a single message via the message item action', async () => {
    store.messages = mockMessages.map(m => ({ ...m }));
    const confirmDeleteSpy = vi.spyOn(store, 'confirmDeleteSelected').mockImplementation(async () => {});
    const messageList = wrapper.findComponent(InboxMessageList);

    await messageList.vm.$emit('delete', mockMessages[0]);

    expect(store.selectedMessages).toEqual([mockMessages[0]]);
    expect(confirmDeleteSpy).toHaveBeenCalled();
  });

  it('sorts unread messages before read messages, newest first within each group', async () => {
    const unreadEarly = createMockInboxMessage({
      id: 'u-early', isRead: false, receivedAt: new Date('2025-01-01T00:00:00Z') 
    });
    const readEarly = createMockInboxMessage({
      id: 'r-early', isRead: true, receivedAt: new Date('2025-01-02T00:00:00Z') 
    });
    const unreadLate = createMockInboxMessage({
      id: 'u-late', isRead: false, receivedAt: new Date('2025-01-10T00:00:00Z') 
    });
    const readLate = createMockInboxMessage({
      id: 'r-late', isRead: true, receivedAt: new Date('2025-01-11T00:00:00Z') 
    });

    store.messages = [readEarly, unreadLate, readLate, unreadEarly];
    await wrapper.vm.$nextTick();

    const messageList = wrapper.findComponent(InboxMessageList);
    const displayed = messageList.props('messages') as InboxMessage[];

    expect(displayed.map(m => m.id)).toEqual(['u-late', 'u-early', 'r-late', 'r-early']);
  });
});
