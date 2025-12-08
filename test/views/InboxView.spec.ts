import { mount, VueWrapper } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import InboxView from '../../src/views/InboxView.vue';
import { useInboxStore } from '../../src/stores/InboxStore';
import InboxSidebar from '../../src/components/inbox/InboxSidebar.vue';
import InboxToolbar from '../../src/components/inbox/InboxToolbar.vue';
import InboxMessageList from '../../src/components/inbox/InboxMessageList.vue';
import type { InboxMessage } from '../../src/services/InboxService';
import { createMockInboxMessage } from '../utils/testHelpers';

// Mocks
const mockPush = vi.fn();
vi.mock('vue-router', () => ({ useRouter: () => ({ push: mockPush }) }));

describe('InboxView.vue', () => {
  let wrapper: VueWrapper;
  let store: ReturnType<typeof useInboxStore>;

  const mockMessages: InboxMessage[] = [
    createMockInboxMessage({ id: '1', receivedAt: new Date('2025-01-10T10:00:00Z'), isRead: false, issueId: 'issue-101', issueTitle: 'Test Issue 1', issueType: 'DEFECT', issueStatus: 'OPEN', projectId: 'proj-1', projectName: 'Project 1' }),
    createMockInboxMessage({ id: '2', receivedAt: new Date('2025-01-11T10:00:00Z'), isRead: true, issueId: 'issue-102', issueTitle: 'Test Issue 2', issueType: 'TASK', issueStatus: 'CLOSED', projectId: 'proj-2', projectName: 'Project 2' }),
  ];


  beforeEach(() => {
    const pinia = createTestingPinia({ stubActions: false });
    store = useInboxStore(pinia);

    server.use(
      http.get('http://localhost:8080/notification/inbox', () => {
        return HttpResponse.json(mockMessages);
      }),
    );

    wrapper = mount(InboxView, {global: {plugins: [pinia],},});
  });

  it('calls fetchInbox on mount', async () => {
    const fetchInboxSpy = vi.spyOn(store, 'fetchInbox');
    await wrapper.vm.$nextTick();
    // fetchInbox is called in onMounted, which happens after mount
    expect(fetchInboxSpy).toHaveBeenCalled();
  });


  it('handles navigation between inbox and done', async () => {
    const sidebar = wrapper.findComponent(InboxSidebar);
    await sidebar.vm.$emit('update:activeNavItem', 'done');

    // Check that sidebar receives the updated prop
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

    // Filter should be applied to store
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
    
    // Message should be marked as read and selection cleared
    expect(store.selectedMessages.length).toBe(0);
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
    
    // Message should be deleted and selection cleared
    expect(store.selectedMessages.length).toBe(0);
  });

  it('handles navigation to issue', async () => {
    const messageList = wrapper.findComponent(InboxMessageList);
    await messageList.vm.$emit('navigate', mockMessages[0]);

    expect(mockPush).toHaveBeenCalled();
  });
});
