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

  // POST create issue (ticketing microservice) — supports plain JSON and multipart/form-data
  // (multipart is used by createTenancyIssueWithAttachment, which appends the issue as a JSON
  // Blob part named 'issue' plus one or more 'attachment' file parts).
  // Note: the multipart branch only counts 'attachment' parts by header, it does not decode the
  // 'issue' JSON payload — jsdom's XHR/FormData/Blob stack does not faithfully transmit part
  // bodies in this test environment (headers arrive, content does not), and undici's strict
  // request.formData() parser rejects the anonymous (filename-less) Blob part the real service
  // code sends. Counting parts via the raw header text sidesteps both limitations.
  http.post(`${TICKETING_BASE}/issues`, async ({ request }) => {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const raw = await request.text();
      const attachmentCount = (raw.match(/name="attachment"/g) || []).length;
      return HttpResponse.json({
        id: 'new-issue-id',
        attachmentCount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

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
    return new HttpResponse(null, { status: 204 });
  }),

  // DELETE an attachment (ticketing microservice)
  // Registered before the generic relation routes below since both share the
  // /issues/:issueId/:x/:y URL shape and MSW resolves overlapping patterns by
  // registration order (first match wins).
  http.delete(`${TICKETING_BASE}/issues/:issueId/attachments/:attachmentId`, ({ params }) => {
    if (params.attachmentId === 'cannot-delete') {
      return HttpResponse.json({ message: 'Cannot delete' }, { status: 403 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // POST upload attachments (ticketing microservice) — called via raw fetch, not apiClient
  http.post(`${TICKETING_BASE}/issues/:issueId/attachments`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // POST create timeline entry for tenant issue flow
  http.post(`${TICKETING_BASE}/tenant-relations/issues/:issueId/timeline`, () => {
    return new HttpResponse(null, { status: 201 });
  }),

  // POST create an issue relation (ticketing microservice)
  http.post(`${TICKETING_BASE}/issues/:issueId/:relationType/:relatedIssueId`, ({ params }) => {
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

  // DELETE an issue relation (ticketing microservice)
  http.delete(`${TICKETING_BASE}/issues/:issueId/:relationType/:relatedIssueId`, () => {
    return HttpResponse.json({}, { status: 204 });
  }),

  // PUT set the parent issue (ticketing microservice)
  http.put(`${TICKETING_BASE}/issues/:issueId/parent/:parentIssueId`, ({ params }) => {
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
];
