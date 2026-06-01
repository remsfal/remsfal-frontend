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

export const organizationHandlers = [
  // GET /organization/employments — must come before /:organizationId
  http.get(`${API_BASE}/organization/employments`, () => {
    return HttpResponse.json(
      { organizations: [mockOrganization], total: 1 },
      { status: 200 },
    );
  }),

  // GET /organization (all owned)
  http.get(`${API_BASE}/organization`, () => {
    return HttpResponse.json(
      { organizations: [mockOrganization], total: 1 },
      { status: 200 },
    );
  }),

  // POST /organization
  http.post(`${API_BASE}/organization`, () => {
    return new HttpResponse(null, {
      status: 201,
      headers: { Location: `${API_BASE}/organization/org-123` },
    });
  }),

  // GET /organization/:organizationId
  http.get(`${API_BASE}/organization/:organizationId`, ({ params }) => {
    return HttpResponse.json(
      { ...mockOrganization, id: params.organizationId },
      { status: 200 },
    );
  }),

  // PATCH /organization/:organizationId
  http.patch(`${API_BASE}/organization/:organizationId`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
 ...mockOrganization, ...body, id: params.organizationId 
},
      { status: 200 },
    );
  }),
];
