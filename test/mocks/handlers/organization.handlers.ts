import { http, HttpResponse } from 'msw';

const API_BASE = '/api/v1';

export const mockOrganization = {
  id: 'org-123',
  name: 'Test GmbH',
  phone: '+4915123456789',
  email: 'info@test-gmbh.de',
  trade: 'Hausverwaltung',
  address: {
    street: 'Musterstraße 1',
    zip: '10115',
    city: 'Berlin',
    province: 'Berlin',
    countryCode: 'DE',
  },
};

export const mockEmployee = {
  id: 'emp-1',
  organizationId: 'org-123',
  organizationName: 'Test GmbH',
  name: 'Max Mustermann',
  email: 'max@test-gmbh.de',
  active: true,
  employeeRole: 'OWNER' as const,
};

export const organizationHandlers = [
  // GET /organizations/employments — must come before /:organizationId
  http.get(`${API_BASE}/organizations/employments`, () => {
    return HttpResponse.json(
      { employees: [mockEmployee] },
      { status: 200 },
    );
  }),

  // GET /organizations (all owned)
  http.get(`${API_BASE}/organizations`, () => {
    return HttpResponse.json(
      { organizations: [mockOrganization], total: 1 },
      { status: 200 },
    );
  }),

  // POST /organizations
  http.post(`${API_BASE}/organizations`, () => {
    return new HttpResponse(null, {
      status: 201,
      headers: { Location: `${API_BASE}/organizations/org-123` },
    });
  }),

  // GET /organizations/:organizationId
  http.get(`${API_BASE}/organizations/:organizationId`, ({ params }) => {
    return HttpResponse.json(
      { ...mockOrganization, id: params.organizationId },
      { status: 200 },
    );
  }),

  // PATCH /organizations/:organizationId
  http.patch(`${API_BASE}/organizations/:organizationId`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        ...mockOrganization, ...body, id: params.organizationId 
      },
      { status: 200 },
    );
  }),
];
