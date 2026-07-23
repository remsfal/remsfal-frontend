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


  it('handles navigation between inbox and done', async () => {
    const sidebar = wrapper.findComponent(InboxSidebar);
    await sidebar.vm.$emit('update:activeNavItem', 'done');

    await wrapper.vm.$nextTick();
    const updatedSidebar = wrapper.findComponent(InboxSidebar);
    expect(updatedSidebar.props('activeNavItem')).toBe('done');
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
    store.messages = [...mockMessages];
    const messageList = wrapper.findComponent(InboxMessageList);
    await messageList.vm.$emit('select-item', mockMessages[0]);
    await wrapper.vm.$nextTick();

    expect(store.selectedMessages.some(m => m.id === mockMessages[0].id)).toBe(true);
  });

  it('handles mark as read for selected messages', async () => {
    store.messages = [...mockMessages];
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
    store.messages = [...mockMessages];
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
});
