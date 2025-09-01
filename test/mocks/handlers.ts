import { http, HttpResponse } from 'msw';

const API_BASE = '/api/v1';

// Store the last (or single) PATCH request for assertions
let lastUpdatedProperty: Record<string, unknown> | null = null;
let lastUpdatedTenancy: Record<string, unknown> | null = null;
export let lastUpdatedApartment: Record<string, unknown> | null = null;
export let lastCreatedCommercial: Record<string, unknown> | null = null;
export let lastUpdatedCommercial: Record<string, unknown> | null = null;
export let lastCreatedSite: Record<string, unknown> | null = null;
export let lastUpdatedSite: Record<string, unknown> | null = null;
export let lastCreatedTask: Record<string, unknown> | null = null;
export let lastUpdatedTask: Record<string, unknown> | null = null;

export const handlers = [
  // GET user once
  http.get(
    `${API_BASE}/user`,
    () => {
      return HttpResponse.json(
        {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
        },
        { status: 200 },
      );
    },
    { once: true },
  ),

  // GET address with query param
  http.get(`${API_BASE}/address`, ({ request }) => {
    const url = new URL(request.url, 'http://localhost');
    const zip = url.searchParams.get('query[zip]');
    if (zip === '12345') {
      return HttpResponse.json(
        [
          {
            city: 'Sample City',
            countryCode: '',
            province: '',
            street: '',
            zip: '12345',
          },
        ],
        { status: 200 },
      );
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
    const body = (await request.json()) as { email: string; role: string };
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
  http.post(
    `${API_BASE}/projects/:projectId/buildings/:buildingId/commercials`,
    async ({ request, params }) => {
      const body = (await request.json()) as Record<string, unknown>;
      lastCreatedCommercial = {
        ...body,
        projectId: params.projectId,
        buildingId: params.buildingId,
      }; // track payload
      return HttpResponse.json({
        id: 'commercial-new-id',
        ...body,
      });
    },
  ),

  // PATCH update commercial
  http.patch(
    `${API_BASE}/projects/:projectId/commercials/:commercialId`,
    async ({ request, params }) => {
      const body = (await request.json()) as Record<string, unknown>;
      lastUpdatedCommercial = { ...body, id: params.commercialId }; // track updated payload
      return HttpResponse.json({
        id: params.commercialId,
        ...body,
      });
    },
  ),

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
  http.patch(
    `${API_BASE}/projects/:projectId/units/:unitId/property`,
    async ({ request, params }) => {
      const body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({
        id: `${params.unitId}-property`,
        ...body,
        updatedAt: new Date().toISOString(),
      });
    },
  ),

  // DELETE property
  http.delete(`${API_BASE}/projects/:projectId/properties/:propertyId`, () => {
    return HttpResponse.json({ success: true }, { status: 200 });
  }),

  // -------- STORAGE SERVICE HANDLERS --------

  // GET single storage
  http.get(`${API_BASE}/projects/:projectId/storages/:storageId`, ({ params }) => {
    return HttpResponse.json({
      id: params.storageId,
      title: 'Initial Storage Title',
      description: 'Initial Storage Description',
      location: 'Initial Location',
      usableSpace: 100,
    });
  }),

  // POST create storage
  http.post(
    `${API_BASE}/projects/:projectId/buildings/:buildingId/storages`,
    async ({ request, params }) => {
      const body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({
        id: 'storage-new-id',
        projectId: params.projectId,
        buildingId: params.buildingId,
        ...body,
      });
    },
  ),

  // PATCH update storage
  http.patch(`${API_BASE}/projects/:projectId/storages/:storageId`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: params.storageId,
      ...body,
      updatedAt: new Date().toISOString(),
    });
  }),

  // DELETE storage
  http.delete(`${API_BASE}/projects/:projectId/storages/:storageId`, ({ params }) => {
    return HttpResponse.json({ success: true, id: params.storageId }, { status: 200 });
  }),

  // PATCH update property (single call)
  http.patch(
    `${API_BASE}/projects/:projectId/units/:unitId/property`,
    async ({ request, params }) => {
      // Capture the payload of this single PATCH call
      lastUpdatedProperty = (await request.json()) as Record<string, unknown>;

      return HttpResponse.json({
        id: `${params.unitId}-property`,
        ...lastUpdatedProperty,
        updatedAt: new Date().toISOString(),
      });
    },
  ),

  // -------- TENANCIES SERVICE HANDLERS --------

  // GET all tenancies
 http.get(`${API_BASE}/tenancies`, () => {
  return HttpResponse.json(
    [
      {
        id: 't1',
        rentalStart: new Date().toISOString(),
        rentalEnd: new Date().toISOString(),
        tenants: [{ id: 'u1', name: 'Max Mustermann', email: 'max@example.com' }], // <-- changed
        listOfUnits: [{ id: 'unit1', title: 'Unit 1' }],
        active: true,
      },
      {
        id: 't2',
        rentalStart: new Date().toISOString(),
        rentalEnd: new Date().toISOString(),
        tenants: [], // <-- changed
        listOfUnits: [],
        active: true,
      },
    ],
    { status: 200 },
  );
}),

  // PATCH update tenancy
  http.patch(`${API_BASE}/tenancies/:tenancyId`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown> | undefined;
    lastUpdatedTenancy = body ?? null;

    return HttpResponse.json({ id: params.tenancyId, ...lastUpdatedTenancy }, { status: 200 });
  }),

  // DELETE tenancy
  http.delete(`${API_BASE}/tenancies/:tenancyId`, ({ params }) => {
    return HttpResponse.json({ success: true, id: params.tenancyId }, { status: 200 });
  }),

  // GET single apartment
  http.get(
    `${API_BASE}/projects/:projectId/buildings/:buildingId/apartments/:apartmentId`,
    ({ params }) => {
      return HttpResponse.json(
        {
          id: params.apartmentId,
          title: 'Initial Apartment Title',
          description: 'Initial Apartment Description',
          livingSpace: 100,
          usableSpace: 80,
          heatingSpace: 60,
          location: 'Initial Location',
        },
        { status: 200 },
      );
    },
  ),

  // PATCH update apartment
  http.patch(
    `${API_BASE}/projects/:projectId/buildings/:buildingId/apartments/:apartmentId`,
    async ({ request, params }) => {
      const body = (await request.json()) as Record<string, unknown>;
      lastUpdatedApartment = body;

      return HttpResponse.json(
        {
          id: params.apartmentId,
          ...body,
        },
        { status: 200 },
      );
    },
  ),

  // POST create apartment
  http.post(
    `${API_BASE}/projects/:projectId/buildings/:buildingId/apartments`,
    async ({ request, params }) => {
      const body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json(
        {
          id: 'new-apartment-id',
          projectId: params.projectId,
          buildingId: params.buildingId,
          ...body,
        },
        { status: 200 },
      );
    },
  ),

  // DELETE apartment
  http.delete(
    `${API_BASE}/projects/:projectId/buildings/:buildingId/apartments/:apartmentId`,
    () => {
      return HttpResponse.json({ success: true }, { status: 200 });
    },
  ),

  // GET single site
  http.get(`${API_BASE}/projects/:projectId/sites/:siteId`, ({ params }) => {
    return HttpResponse.json({
      id: params.siteId,
      title: 'New Site',
      description: 'A description of the new site.',
      space: 1000, // match your test
      address: {
        street: 'Main St',
        city: 'Sample City',
        zip: '12345',
        province: '',
        countryCode: '',
      },
    });
  }),

  // POST create site
  http.post(
    `${API_BASE}/projects/:projectId/properties/:propertyId/sites`,
    async ({ request, params }) => {
      const body = (await request.json()) as Record<string, unknown> | undefined;
      lastCreatedSite = body ?? null; // fallback to null if undefined
      return HttpResponse.json({
        id: 'new-site-id',
        projectId: params.projectId,
        propertyId: params.propertyId,
        ...(body ?? {}),
      });
    },
  ),

  // PATCH update site
  // PATCH update site
  http.patch(`${API_BASE}/projects/:projectId/sites/:siteId`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown> | undefined;
    lastUpdatedSite = body ?? null;
    return HttpResponse.json({
      id: params.siteId,
      ...(body ?? {}),
    });
  }),

  // DELETE site
  http.delete(`${API_BASE}/projects/:projectId/sites/:siteId`, () => {
    return new HttpResponse(null, { status: 204 }); // resolves to undefined
  }),

  // GET list of tasks
// GET list of tasks
http.get(`${API_BASE}/projects/:projectId/tasks`, ({ request }) => {
  const url = new URL(request.url);
  const status = url.searchParams.get('status') ?? undefined;
  const owner = url.searchParams.get('owner') ?? undefined;

  const tasks = [
    {
      id: 'test-task',
      title: 'Test Task',
      description: 'Test Description',
      status: status ?? 'OPEN',
      ownerId: owner ?? 'owner1',
      created_at: new Date().toISOString(),
      modified_at: new Date().toISOString(),
      blocked_by: '',
      duplicate_of: '',
      related_to: '',
    },
  ];

  return HttpResponse.json({ tasks });
}),

  // GET single task
  http.get(`${API_BASE}/projects/:projectId/tasks/:taskId`, ({ params }) => {
    return HttpResponse.json({
      id: params.taskId,
      title: 'Test Task',
      description: 'A test task',
      status: 'OPEN',
      ownerId: 'owner1',
      created_at: new Date().toISOString(),
      modified_at: new Date().toISOString(),
      blocked_by: '',
      duplicate_of: '',
      related_to: '',
    });
  }),

  // POST create task
  http.post(`${API_BASE}/projects/:projectId/tasks`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown> | undefined;
    const task = { ...(body ?? {}), id: 'new-task-id' };
    lastCreatedTask = task;
    return HttpResponse.json(task);
  }),

  // PATCH modify task
  http.patch(`${API_BASE}/projects/:projectId/tasks/:taskId`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown> | undefined;
    const task = { id: params.taskId, ...(body ?? {}) };
    lastUpdatedTask = task;
    return HttpResponse.json(task);
  }),
];
