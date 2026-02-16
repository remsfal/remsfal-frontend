import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { useInboxStore } from '@/stores/InboxStore';
import type { InboxMessage } from '@/services/InboxService';
import { createMockInboxMessage } from '../utils/testHelpers';

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

      expect(store.messages.length).toBe(3);
      expect(store.messages[0].id).toBe('1');
      expect(store.messages[0].receivedAt instanceof Date).toBe(true);
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

      expect(store.messages[0].receivedAt instanceof Date).toBe(true);
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

    it('handles errors gracefully', async () => {
      store.messages = mockMessages.map(msg => ({ ...msg }));
      server.use(
        http.patch('http://localhost:8080/notification/inbox/:messageId/read', () => {
          return HttpResponse.json({ error: 'Not found' }, { status: 404 });
        }),
      );

      const message = store.messages[0];
      
      await expect(store.markAsRead(message)).resolves.not.toThrow();

      const messageAfterError = store.messages.find(m => m.id === message.id);
      expect(messageAfterError).toBeDefined();
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
      
      expect(store.selectedMessages.length).toBe(2);
      expect(msg1.isRead).toBe(false);
      expect(msg3.isRead).toBe(false);

      await store.markReadSelected();

      expect(msg1.isRead).toBe(true);
      expect(msg3.isRead).toBe(true);
      expect(store.selectedMessages.length).toBe(0);
    });

    it('clears selection after marking as read', async () => {
      await store.markReadSelected();
      expect(store.selectedMessages.length).toBe(0);
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
      expect(store.selectedMessages.length).toBe(2);

      await store.confirmDeleteSelected();

      expect(store.messages.length).toBe(initialLength - 2);
      expect(store.messages.find(m => m.id === '1')).toBeUndefined();
      expect(store.messages.find(m => m.id === '2')).toBeUndefined();
      expect(store.selectedMessages.length).toBe(0);
    });

    it('handles errors gracefully', async () => {
      store.messages = mockMessages.map(msg => ({ ...msg }));
      store.selectedMessages = [store.messages[0], store.messages[1]];
      
      server.use(
        http.delete('http://localhost:8080/notification/inbox/:messageId', () => {
          return HttpResponse.json({ error: 'Not found' }, { status: 404 });
        }),
      );

      await expect(store.confirmDeleteSelected()).resolves.not.toThrow();

      expect(store.messages.length).toBeGreaterThan(0);
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

      expect(filtered.length).toBe(2);
      expect(filtered.every(m => !m.isRead)).toBe(true);
    });

    it('filters by activeTab all', () => {
      store.activeTab = 'all';
      const filtered = store.filteredMessages;

      expect(filtered.length).toBe(3);
    });

    it('filters by search query', () => {
      store.searchQuery = 'Issue 1';
      const filtered = store.filteredMessages;

      expect(filtered.length).toBe(1);
      expect(filtered[0].issueTitle).toBe('Test Issue 1');
    });

    it('filters by project', () => {
      store.filterProject = ['proj-1'];
      const filtered = store.filteredMessages;

      expect(filtered.length).toBe(2);
      expect(filtered.every(m => m.projectId === 'proj-1')).toBe(true);
    });

    it('filters by issue type', () => {
      store.filterIssueType = ['DEFECT'];
      const filtered = store.filteredMessages;

      expect(filtered.length).toBe(1);
      expect(filtered[0].issueType).toBe('DEFECT');
    });

    it('filters by issue status', () => {
      store.filterIssueStatus = ['OPEN'];
      const filtered = store.filteredMessages;

      expect(filtered.length).toBe(1);
      expect(filtered[0].issueStatus).toBe('OPEN');
    });

    it('combines multiple filters', () => {
      store.activeTab = 'unread';
      store.filterProject = ['proj-1'];
      store.filterIssueType = ['DEFECT'];
      const filtered = store.filteredMessages;

      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('1');
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

      expect(options.length).toBe(2);
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

      expect(store.filterProject.length).toBe(0);
      expect(store.filterIssueType.length).toBe(0);
      expect(store.filterIssueStatus.length).toBe(0);
      expect(store.searchQuery).toBe('');
      expect(store.filterDateRange).toBeNull();
    });
  });
});

