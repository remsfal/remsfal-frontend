import { http, HttpResponse } from 'msw';

export const activityFeedHandlers = [
  // GET activities
  http.get('/ticketing/v1/activities', () => {
    return HttpResponse.json({
      size: 3,
      nextCursor: null,
      activities: [
        {
          id: '1',
          createdAt: new Date('2025-06-01T10:15:00').toISOString(),
          read: false,
          issueId: 'issue-101',
          title: 'Heizung defekt',
          issueType: 'DEFECT',
          status: 'OPEN',
          projectId: 'proj-1',
        },
        {
          id: '2',
          createdAt: new Date('2025-05-28T14:30:00').toISOString(),
          read: false,
          issueId: 'issue-102',
          title: 'Wartung Aufzug',
          issueType: 'MAINTENANCE',
          status: 'IN_PROGRESS',
          projectId: 'proj-1',
        },
        {
          id: '3',
          createdAt: new Date('2025-05-25T08:00:00').toISOString(),
          read: true,
          issueId: 'issue-201',
          title: 'Fenster undicht',
          issueType: 'DEFECT',
          status: 'PENDING',
          projectId: 'proj-2',
        },
      ],
    });
  }),

  // PATCH update activity read status
  http.patch('/ticketing/v1/activities/:activityId/status', () => {
    return HttpResponse.json({});
  }),

  // DELETE activity
  http.delete('/ticketing/v1/activities/:activityId', () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
