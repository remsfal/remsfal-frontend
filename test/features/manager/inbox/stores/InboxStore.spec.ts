import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../mocks/server';
import { useInboxStore } from '@/features/manager/inbox/stores/InboxStore';
import type { InboxMessage } from '@/features/manager/inbox/services/InboxService';
import { createMockInboxMessage } from '../../../../utils/testHelpers';

describe('InboxStore', () => {
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
    createMockInboxMessage({
      id: '3',
      receivedAt: new Date('2025-01-12T10:00:00Z'),
      isRead: false,
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
    store = useInboxStore();

    server.use(
      http.get('http://localhost:8080/notification/inbox', () => {
        return HttpResponse.json(mockMessages);
      }),
      http.patch('http://localhost:8080/notification/inbox/:messageId/read', () => {
        return new HttpResponse(null, { status: 204 });
      }),
      http.delete('http://localhost:8080/notification/inbox/:messageId', () => {
        return new HttpResponse(null, { status: 204 });
      }),
    );
  });

  describe('fetchInbox', () => {
    it('loads messages and normalizes receivedAt', async () => {
      await store.fetchInbox();

      expect(store.messages).toHaveLength(3);
      expect(store.messages[0].id).toBe('1');
      expect(store.messages[0].receivedAt).toBeInstanceOf(Date);
      expect(store.isLoading).toBe(false);
    });

    it('normalizes string dates to Date objects', async () => {
      server.use(
        http.get('http://localhost:8080/notification/inbox', () => {
          return HttpResponse.json([
            {
              ...mockMessages[0],
              receivedAt: '2025-01-10T10:00:00Z',
            },
          ]);
        }),
      );

      await store.fetchInbox();

      expect(store.messages[0].receivedAt).toBeInstanceOf(Date);
    });
  });

  describe('markAsRead', () => {
    beforeEach(async () => {
      store.messages = mockMessages.map(msg => ({
        ...msg,
        receivedAt: new Date(msg.receivedAt)
      }));
    });

    it('calls service and updates local state optimistically', async () => {
      const message = store.messages[0];
      expect(message.isRead).toBe(false);

      await store.markAsRead(message);

      expect(message.isRead).toBe(true);
      expect(store.messages[0].isRead).toBe(true);
    });

    it('does nothing when the message is not found in the store', async () => {
      const unknownMessage = createMockInboxMessage({ id: 'unknown-id' });

      await expect(store.markAsRead(unknownMessage)).resolves.not.toThrow();

      expect(store.messages.find(m => m.id === 'unknown-id')).toBeUndefined();
    });

    it('handles errors gracefully', async () => {
      store.messages = mockMessages.map(msg => ({ ...msg }));
      server.use(
        http.patch('/notification/inbox/:messageId/read', () => {
          return HttpResponse.json({ error: 'Not found' }, { status: 404 });
        }),
      );

      const message = store.messages[0];
      const originalIsRead = message.isRead;

      await expect(store.markAsRead(message)).resolves.not.toThrow();

      const messageAfterError = store.messages.find(m => m.id === message.id);
      expect(messageAfterError?.isRead).toBe(originalIsRead);
    });
  });

  describe('markReadSelected', () => {
    beforeEach(async () => {
      store.messages = mockMessages.map(msg => ({
        ...msg,
        receivedAt: new Date(msg.receivedAt)
      }));
      store.selectedMessages = [store.messages[0], store.messages[2]];
    });

    it('calls service for all selected messages and updates local state', async () => {
      const msg1 = { ...mockMessages[0], isRead: false };
      const msg2 = { ...mockMessages[1], isRead: true };
      const msg3 = { ...mockMessages[2], isRead: false };
      store.messages = [msg1, msg2, msg3];
      store.selectedMessages = [msg1, msg3];

      expect(store.selectedMessages).toHaveLength(2);
      expect(msg1.isRead).toBe(false);
      expect(msg3.isRead).toBe(false);

      await store.markReadSelected();

      expect(msg1.isRead).toBe(true);
      expect(msg3.isRead).toBe(true);
      expect(store.selectedMessages).toHaveLength(0);
    });

    it('clears selection after marking as read', async () => {
      await store.markReadSelected();
      expect(store.selectedMessages).toHaveLength(0);
    });

    it('reverts optimistic updates when the API call fails', async () => {
      const originalStates = store.messages.map(m => m.isRead);
      server.use(
        http.patch('/notification/inbox/:messageId/read', () => {
          return HttpResponse.json({ error: 'Not found' }, { status: 404 });
        }),
      );

      await expect(store.markReadSelected()).resolves.not.toThrow();

      expect(store.messages.map(m => m.isRead)).toEqual(originalStates);
    });
  });

  describe('confirmDeleteSelected', () => {
    beforeEach(async () => {
      store.messages = mockMessages.map(msg => ({
        ...msg,
        receivedAt: new Date(msg.receivedAt)
      }));
      store.selectedMessages = [store.messages[0], store.messages[1]];
    });

    it('calls service for all selected messages and removes them from local state', async () => {
      const initialLength = store.messages.length;
      expect(store.selectedMessages).toHaveLength(2);

      await store.confirmDeleteSelected();

      expect(store.messages).toHaveLength(initialLength - 2);
      expect(store.messages.find(m => m.id === '1')).toBeUndefined();
      expect(store.messages.find(m => m.id === '2')).toBeUndefined();
      expect(store.selectedMessages).toHaveLength(0);
    });

    it('restores deleted messages when the API call fails', async () => {
      store.messages = mockMessages.map(msg => ({ ...msg }));
      store.selectedMessages = [store.messages[0], store.messages[1]];
      const initialLength = store.messages.length;

      server.use(
        http.delete('/notification/inbox/:messageId', () => {
          return HttpResponse.json({ error: 'Not found' }, { status: 404 });
        }),
      );

      await expect(store.confirmDeleteSelected()).resolves.not.toThrow();

      expect(store.messages).toHaveLength(initialLength);
      expect(store.messages.find(m => m.id === '1')).toBeDefined();
      expect(store.messages.find(m => m.id === '2')).toBeDefined();
    });
  });

  describe('filteredMessages', () => {
    beforeEach(() => {
      store.messages = mockMessages.map(msg => ({
        ...msg,
        receivedAt: new Date(msg.receivedAt)
      }));
    });

    it('filters by activeTab unread', () => {
      store.activeTab = 'unread';
      const filtered = store.filteredMessages;

      expect(filtered).toHaveLength(2);
      expect(filtered.every(m => !m.isRead)).toBe(true);
    });

    it('filters by activeTab all', () => {
      store.activeTab = 'all';
      const filtered = store.filteredMessages;

      expect(filtered).toHaveLength(3);
    });

    it('filters by search query', () => {
      store.searchQuery = 'Issue 1';
      const filtered = store.filteredMessages;

      expect(filtered).toHaveLength(1);
      expect(filtered[0].issueTitle).toBe('Test Issue 1');
    });

    it('filters by project', () => {
      store.filterProject = ['proj-1'];
      const filtered = store.filteredMessages;

      expect(filtered).toHaveLength(2);
      expect(filtered.every(m => m.projectId === 'proj-1')).toBe(true);
    });

    it('filters by issue type', () => {
      store.filterIssueType = ['DEFECT'];
      const filtered = store.filteredMessages;

      expect(filtered).toHaveLength(1);
      expect(filtered[0].issueType).toBe('DEFECT');
    });

    it('filters by issue status', () => {
      store.filterIssueStatus = ['OPEN'];
      const filtered = store.filteredMessages;

      expect(filtered).toHaveLength(1);
      expect(filtered[0].issueStatus).toBe('OPEN');
    });

    it('combines multiple filters', () => {
      store.activeTab = 'unread';
      store.filterProject = ['proj-1'];
      store.filterIssueType = ['DEFECT'];
      const filtered = store.filteredMessages;

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    it('filters by a valid date range', () => {
      store.filterDateRange = [new Date('2025-01-10T00:00:00Z'), new Date('2025-01-11T00:00:00Z')];
      const filtered = store.filteredMessages;

      expect(filtered.map(m => m.id).sort()).toEqual(['1', '2']);
    });

    it('excludes messages outside the date range', () => {
      store.filterDateRange = [new Date('2025-02-01T00:00:00Z'), new Date('2025-02-02T00:00:00Z')];
      const filtered = store.filteredMessages;

      expect(filtered).toHaveLength(0);
    });

    it('ignores an incomplete date range', () => {
      store.filterDateRange = [undefined as unknown as Date, undefined as unknown as Date];
      const filtered = store.filteredMessages;

      expect(filtered).toHaveLength(mockMessages.length);
    });
  });

  describe('issueTypeOptions', () => {
    beforeEach(() => {
      store.messages = [...mockMessages];
    });

    it('returns unique issue type options', () => {
      const options = store.issueTypeOptions;

      expect(options.map(o => o.value).sort()).toEqual(['DEFECT', 'MAINTENANCE', 'TASK']);
    });
  });

  describe('issueStatusOptions', () => {
    beforeEach(() => {
      store.messages = [...mockMessages];
    });

    it('returns unique issue status options', () => {
      const options = store.issueStatusOptions;

      expect(options.map(o => o.value).sort()).toEqual(['CLOSED', 'IN_PROGRESS', 'OPEN']);
    });
  });

  describe('groupedMessages', () => {
    it('returns the same messages as filteredMessages', () => {
      store.messages = [...mockMessages];

      expect(store.groupedMessages).toEqual(store.filteredMessages);
    });
  });

  describe('unreadCount', () => {
    beforeEach(() => {
      store.messages = mockMessages.map(msg => ({
        ...msg,
        receivedAt: new Date(msg.receivedAt)
      }));
    });

    it('calculates unread count correctly', () => {
      expect(store.unreadCount).toBe(2);
    });

    it('updates when messages are marked as read', async () => {
      expect(store.unreadCount).toBe(2);

      // Find first unread message
      const unreadMessage = store.messages.find(m => !m.isRead);
      expect(unreadMessage).toBeDefined();
      
      await store.markAsRead(unreadMessage!);

      expect(store.unreadCount).toBe(1);
    });
  });

  describe('projectOptions', () => {
    beforeEach(async () => {
      store.messages = [...mockMessages];
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

