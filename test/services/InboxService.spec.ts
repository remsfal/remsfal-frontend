import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { inboxService, type InboxMessage } from '../../src/services/InboxService';

const mockMessages: InboxMessage[] = [
  {
    id: '1',
    receivedAt: new Date('2025-06-01T10:15:00'),
    isRead: false,
    issueId: 'issue-101',
    issueTitle: 'Heizung defekt',
    issueType: 'DEFECT',
    issueStatus: 'OPEN',
    projectId: 'proj-1',
    projectName: 'Neubau Musterstraße',
  },
  {
    id: '2',
    receivedAt: new Date('2025-05-28T14:30:00'),
    isRead: false,
    issueId: 'issue-102',
    issueTitle: 'Wartung Aufzug',
    issueType: 'MAINTENANCE',
    issueStatus: 'IN_PROGRESS',
    projectId: 'proj-1',
    projectName: 'Neubau Musterstraße',
  },
  {
    id: '3',
    receivedAt: new Date('2025-05-25T08:00:00'),
    isRead: true,
    issueId: 'issue-201',
    issueTitle: 'Fenster undicht',
    issueType: 'DEFECT',
    issueStatus: 'PENDING',
    projectId: 'proj-2',
    projectName: 'Campus Treskowallee',
  },
];

describe('InboxService', () => {
  beforeEach(() => {
    server.use(
      http.get('/notification/inbox', () => {
        return HttpResponse.json(mockMessages);
      }),
    );
  });


  it('should fetch inbox data from API', async () => {
    const data = await inboxService.fetchInboxData();

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(3);
    expect(data[0].id).toBe('1');
    expect(data[0].issueTitle).toBe('Heizung defekt');
  });

  it('should mark message as read via API', async () => {
    let markAsReadCalled = false;
    server.use(
      http.patch('/notification/inbox/:messageId/read', ({ params }) => {
        markAsReadCalled = true;
        expect(params.messageId).toBe('1');
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await inboxService.markAsRead('1');
    expect(markAsReadCalled).toBe(true);
  });

  it('should delete message via API', async () => {
    let deleteCalled = false;
    server.use(
      http.delete('/notification/inbox/:messageId', ({ params }) => {
        deleteCalled = true;
        expect(params.messageId).toBe('2');
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await inboxService.deleteMessage('2');
    expect(deleteCalled).toBe(true);
  });

});
