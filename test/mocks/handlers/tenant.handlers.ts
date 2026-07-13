import { http, HttpResponse } from 'msw';

const API_BASE = '/api/v1';

export const tenantHandlers = [
  // GET all tenants for a project
  http.get(`${API_BASE}/projects/:projectId/tenants`, ({ params }) => {
    if (params.projectId === 'empty-project') {
      return HttpResponse.json({});
    }
    return HttpResponse.json({
      tenants: [
        {
          id: 'tenant-1', firstName: 'Max', lastName: 'Mustermann', email: 'max@example.com', active: true,
        },
        {
          id: 'tenant-2', firstName: 'Julia', lastName: 'Schmidt', email: 'julia@example.com', active: false,
        },
      ],
    });
  }),

  // GET single tenant
  http.get(`${API_BASE}/projects/:projectId/tenants/:tenantId`, ({ params }) => {
    if (params.tenantId === 'not-found') {
      return HttpResponse.json({ message: 'Tenant not found' }, { status: 404 });
    }
    return HttpResponse.json({
      id: params.tenantId,
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'max@example.com',
    });
  }),

  // PATCH update tenant
  http.patch(`${API_BASE}/projects/:projectId/tenants/:tenantId`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: params.tenantId,
      ...body,
    });
  }),
];
