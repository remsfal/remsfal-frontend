import { http, HttpResponse } from 'msw';

export const inboxHandlers = [
  // GET inbox messages
  http.get('/notification/inbox', () => {
    return HttpResponse.json([
      {
        id: '1',
        receivedAt: new Date('2025-06-01T10:15:00').toISOString(),
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
        receivedAt: new Date('2025-05-28T14:30:00').toISOString(),
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
        receivedAt: new Date('2025-05-25T08:00:00').toISOString(),
        isRead: true,
        issueId: 'issue-201',
        issueTitle: 'Fenster undicht',
        issueType: 'DEFECT',
        issueStatus: 'PENDING',
        projectId: 'proj-2',
        projectName: 'Campus Treskowallee',
      },
    ]);
  }),

  // PATCH mark message as read
  http.patch('/notification/inbox/:messageId/read', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // DELETE message
  http.delete('/notification/inbox/:messageId', () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
