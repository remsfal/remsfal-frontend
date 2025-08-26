import { http, HttpResponse } from 'msw';

const API_BASE = '/api/v1';

export const handlers = [
  // GET user once
  http.get(`${API_BASE}/user`, () => {
    return HttpResponse.json(
      {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
      },
      { status: 200 },
    );
  }, { once: true }),

  // GET address with query param
  http.get(`${API_BASE}/address`, ({ request }) => {
    const url = new URL(request.url, 'http://localhost');
    const zip = url.searchParams.get('query[zip]');
    if (zip === '12345') {
      return HttpResponse.json([
        {
          city: 'Sample City',
          countryCode: '',
          province: '',
          street: '',
          zip: '12345',
        },
      ], { status: 200 });
    }
    return HttpResponse.json([], { status: 200 });
  }),

  // PATCH user update
  http.patch(`${API_BASE}/user`, async ({ request }) => {
    const updatedUser = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...updatedUser, id: 'user-123' }, { status: 200 });
  }),

  // DELETE user
  http.delete(`${API_BASE}/user`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // GET project members
  http.get(`${API_BASE}/projects/:projectId/members`, () => {
    return HttpResponse.json(
      {
        members: [
          {
            id: '1',
            name: 'Max Mustermann',
            email: 'max@example.com',
            role: 'MANAGER',
            active: true,
            privileged: true,
          },
          {
            id: '2',
            name: 'Julia Schmidt',
            email: 'julia@example.com',
            role: 'STAFF',
            active: true,
            privileged: false,
          },
        ],
      },
      { status: 200 },
    );
  }),

  // POST add new member
  http.post(`${API_BASE}/projects/:projectId/members`, async ({ request }) => {
    const body = (await request.json()) as { email: string, role: string };
    return HttpResponse.json(
      {
        id: 'new-id-123',
        email: body.email,
        role: body.role,
        active: true,
        privileged: false,
      },
      { status: 200 },
    );
  }),

  // PATCH update member role
  http.patch(`${API_BASE}/projects/:projectId/members/:memberId`, async ({ params, request }) => {
    const body = (await request.json()) as { role: string };
    return HttpResponse.json(
      {
        id: params.memberId,
        name: 'Updated User',
        email: 'updated@example.com',
        role: body.role,
        active: true,
        privileged: false,
      },
      { status: 200 },
    );
  }),

  // DELETE remove member
  http.delete(`${API_BASE}/projects/:projectId/members/:memberId`, () => {
    return HttpResponse.json({ success: true }, { status: 200 });
  }),

  // GET commercial unit
  http.get(`${API_BASE}/projects/:projectId/commercials/:commercialId`, ({ params }) => {
    return HttpResponse.json({
      id: params.commercialId,
      title: 'Commercial Space 1',
      location: 'Downtown',
      description: 'A spacious commercial area',
      commercialSpace: 100,
      usableSpace: 80,
      heatingSpace: 60,
    });
  }),

  // POST create commercial
  http.post(`${API_BASE}/projects/:projectId/buildings/:buildingId/commercials`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: 'commercial-new-id',
      ...body,
    });
  }),

  // PATCH update commercial
  http.patch(`${API_BASE}/projects/:projectId/commercials/:commercialId`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: params.commercialId,
      ...body,
    });
  }),

  // DELETE commercial
  http.delete(`${API_BASE}/projects/:projectId/commercials/:commercialId`, () => {
    return HttpResponse.json({ success: true }, { status: 200 });
  }),

  // -------- PROPERTY SERVICE HANDLERS --------

  // POST create property
  http.post(`${API_BASE}/projects/:projectId/properties`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: 'property-new-id',
      ...body,
    });
  }),

  // GET property tree (list)
  http.get(`${API_BASE}/projects/:projectId/properties`, () => {
    // example tree structure:
    return HttpResponse.json({
      properties: [
        {
          key: 'property-1',
          data: {
            type: 'PROPERTY',
            title: 'Property One',
            description: 'Main property',
            tenant: 'Tenant A',
            usable_space: 120,
          },
          children: [],
        },
      ],
    });
  }),

  // GET single property by id
  http.get(`${API_BASE}/projects/:projectId/properties/:propertyId`, ({ params }) => {
    return HttpResponse.json({
      id: params.propertyId,
      type: 'PROPERTY',
      title: 'Property ' + params.propertyId,
      description: 'Sample property description',
      landRegisterEntry: 'LR-123',
      district: 'District 9',
      sheetNumber: 'Sheet 5',
      plotArea: 7,
      effectiveSpace: 100,
      corridor: '1A',
      parcel: 'Parcel 22',
      usageType: 'Residential',
    });
  }),

  // PATCH update property
  http.patch(`${API_BASE}/projects/:projectId/units/:unitId/property`, async ({ request, params }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: `${params.unitId}-property`,
      ...body,
      updatedAt: new Date().toISOString(),
    });
  }),

  // DELETE property
  http.delete(`${API_BASE}/projects/:projectId/properties/:propertyId`, () => {
    return HttpResponse.json({ success: true }, { status: 200 });
  }),
];
