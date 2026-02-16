import { http, HttpResponse } from 'msw';

const TICKETING_BASE = '/ticketing/v1';

export const issueHandlers = [
  // GET list of issues (ticketing microservice)
  http.get(`${TICKETING_BASE}/issues`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const owner = url.searchParams.get('owner');

    const allIssues = [
      {
        id: 'issue-1',
        title: 'Test Issue 1',
        description: 'Test Description 1',
        status: 'OPEN',
        ownerId: 'owner1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'issue-2',
        title: 'Test Issue 2',
        description: 'Test Description 2',
        status: 'IN_PROGRESS',
        ownerId: 'owner2',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'issue-3',
        title: 'Test Issue 3',
        description: 'Test Description 3',
        status: 'CLOSED',
        ownerId: 'owner1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    let filteredIssues = allIssues;

    if (status) {
      filteredIssues = filteredIssues.filter((issue) => issue.status === status);
    }

    if (owner) {
      filteredIssues = filteredIssues.filter((issue) => issue.ownerId === owner);
    }

    return HttpResponse.json({
      issues: filteredIssues,
      first: 0,
      size: filteredIssues.length,
      total: filteredIssues.length,
    });
  }),

  // GET single issue (ticketing microservice)
  http.get(`${TICKETING_BASE}/issues/:issueId`, ({ params }) => {
    if (params.issueId === 'non-existing' || params.issueId === 'non-existing-id') {
      return HttpResponse.json({ message: 'Issue not found' }, { status: 404 });
    }
    return HttpResponse.json({
      id: params.issueId,
      title: 'Test Issue',
      description: 'A test issue description',
      status: 'OPEN',
      ownerId: 'owner1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),

  // POST create issue (ticketing microservice)
  http.post(`${TICKETING_BASE}/issues`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: 'new-issue-id',
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),

  // PATCH update issue (ticketing microservice)
  http.patch(`${TICKETING_BASE}/issues/:issueId`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: params.issueId,
      ...body,
      updatedAt: new Date().toISOString(),
    });
  }),

  // DELETE issue (ticketing microservice)
  http.delete(`${TICKETING_BASE}/issues/:issueId`, ({ params }) => {
    if (params.issueId === 'cannot-delete') {
      return HttpResponse.json({ message: 'Cannot delete' }, { status: 403 });
    }
    return HttpResponse.json({}, { status: 204 });
  }),
];
