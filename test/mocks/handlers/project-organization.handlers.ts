import { http, HttpResponse } from 'msw';

const API_BASE = '/api/v1';

export const projectOrganizationHandlers = [
  // GET project organizations
  http.get(`${API_BASE}/projects/:projectId/organizations`, () => {
    return HttpResponse.json(
      {
        organizations: [
          {
            organizationId: '11111111-1111-1111-1111-111111111111',
            organizationName: 'Test GmbH',
            role: 'MANAGER',
          },
          {
            organizationId: '22222222-2222-2222-2222-222222222222',
            organizationName: 'Muster AG',
            role: 'STAFF',
          },
        ],
      },
      { status: 200 },
    );
  }),

  // POST add organization
  http.post(`${API_BASE}/projects/:projectId/organizations`, async ({ request }) => {
    const body = (await request.json()) as { organizationId: string; role: string };
    return HttpResponse.json(
      {
        organizationId: body.organizationId,
        organizationName: 'New Org GmbH',
        role: body.role,
      },
      { status: 200 },
    );
  }),

  // PATCH update organization role
  http.patch(`${API_BASE}/projects/:projectId/organizations/:organizationId`, async ({ params, request }) => {
    const body = (await request.json()) as { role: string };
    return HttpResponse.json(
      {
        organizationId: params.organizationId,
        organizationName: 'Updated Org',
        role: body.role,
      },
      { status: 200 },
    );
  }),

  // DELETE remove organization
  http.delete(`${API_BASE}/projects/:projectId/organizations/:organizationId`, () => {
    return HttpResponse.json({ success: true }, { status: 200 });
  }),
];
