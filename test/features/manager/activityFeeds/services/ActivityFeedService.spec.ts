import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../mocks/server';
import { activityFeedService, type ActivityFeedJson } from '@/features/manager/activityFeeds/services/ActivityFeedService';

const mockActivities: ActivityFeedJson[] = [
  {
    id: '1',
    createdAt: '2025-06-01T10:15:00.000Z',
    read: false,
    issueId: 'issue-101',
    title: 'Heizung defekt',
    issueType: 'DEFECT',
    status: 'OPEN',
    projectId: 'proj-1',
  },
  {
    id: '2',
    createdAt: '2025-05-28T14:30:00.000Z',
    read: false,
    issueId: 'issue-102',
    title: 'Wartung Aufzug',
    issueType: 'MAINTENANCE',
    status: 'IN_PROGRESS',
    projectId: 'proj-1',
  },
  {
    id: '3',
    createdAt: '2025-05-25T08:00:00.000Z',
    read: true,
    issueId: 'issue-201',
    title: 'Fenster undicht',
    issueType: 'DEFECT',
    status: 'PENDING',
    projectId: 'proj-2',
  },
];

describe('ActivityFeedService', () => {
  beforeEach(() => {
    server.use(
      http.get('/ticketing/v1/activities', () => {
        return HttpResponse.json({
          size: mockActivities.length, nextCursor: null, activities: mockActivities 
        });
      }),
    );
  });

  it('should fetch activities from the API', async () => {
    const data = await activityFeedService.fetchActivities({ limit: 50 });

    expect(Array.isArray(data.activities)).toBe(true);
    expect(data.activities?.length).toBe(3);
    expect(data.activities?.[0].id).toBe('1');
    expect(data.activities?.[0].title).toBe('Heizung defekt');
    expect(data.nextCursor).toBeNull();
  });

  it('should pass limit and cursor as query params', async () => {
    let receivedLimit: string | null = null;
    let receivedCursor: string | null = null;
    server.use(
      http.get('/ticketing/v1/activities', ({ request }) => {
        const url = new URL(request.url);
        receivedLimit = url.searchParams.get('limit');
        receivedCursor = url.searchParams.get('cursor');
        return HttpResponse.json({
          size: 0, nextCursor: null, activities: [] 
        });
      }),
    );

    await activityFeedService.fetchActivities({ limit: 25, cursor: 'abc-cursor' });

    expect(receivedLimit).toBe('25');
    expect(receivedCursor).toBe('abc-cursor');
  });

  it('should update the read status via the status endpoint', async () => {
    let statusCalled = false;
    let receivedRead: string | null = null;
    server.use(
      http.patch('/ticketing/v1/activities/:activityId/status', ({ params, request }) => {
        statusCalled = true;
        expect(params.activityId).toBe('1');
        receivedRead = new URL(request.url).searchParams.get('read');
        return HttpResponse.json(mockActivities[0]);
      }),
    );

    await activityFeedService.setReadStatus('1', true);

    expect(statusCalled).toBe(true);
    expect(receivedRead).toBe('true');
  });

  it('should delete an activity via the API', async () => {
    let deleteCalled = false;
    server.use(
      http.delete('/ticketing/v1/activities/:activityId', ({ params }) => {
        deleteCalled = true;
        expect(params.activityId).toBe('2');
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await activityFeedService.deleteActivity('2');
    expect(deleteCalled).toBe(true);
  });
});
