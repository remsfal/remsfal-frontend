import { http, HttpResponse } from 'msw';

const API_BASE = '/api/v1';
const TICKETING_BASE = '/ticketing/v1';

// Used in tests to capture the last request data for each entity.
// This object allows test assertions to verify the payloads sent to mock handlers.
export const lastRequests: Record<string, Record<string, unknown> | null> = {
  property: null,
  tenancy: null,
  apartment: null,
  createdCommercial: null,
  updatedCommercial: null,
  createdSite: null,
  updatedSite: null,
  createdTask: null,
  updatedTask: null,
};

export const handlers = [
  // GET user
  http.get(`${API_BASE}/user`, () => {
    return HttpResponse.json(
      {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
      },
      { status: 200 },
    );
  }),

  // GET address with query param
  http.get(`${API_BASE}/address`, ({ request }) => {
    const url = new URL(request.url, 'http://localhost');
    const zip = url.searchParams.get('zip') || url.searchParams.get('query[zip]');
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
    if (params.commercialId === 'not-found') {
      return HttpResponse.json({ message: 'Commercial not found' }, { status: 404 });
    }
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
      lastRequests.createdCommercial = {
        ...body,
        projectId: params.projectId,
        buildingId: params.buildingId,
      };
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
      lastRequests.updatedCommercial = { ...body, id: params.commercialId };
      return HttpResponse.json({
        id: params.commercialId,
        ...body,
      });
    },
  ),

  // DELETE commercial
  http.delete(`${API_BASE}/projects/:projectId/commercials/:commercialId`, ({ params }) => {
    if (params.commercialId === 'cannot-delete') {
      return HttpResponse.json({ message: 'Cannot delete' }, { status: 403 });
    }
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

  // PATCH update property (unit-based endpoint)
  http.patch(
    `${API_BASE}/projects/:projectId/units/:unitId/property`,
    async ({ request, params }) => {
      lastRequests.property = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({
        id: `${params.unitId}-property`,
        ...lastRequests.property,
        updatedAt: new Date().toISOString(),
      });
    },
  ),

  // PATCH update property (property-based endpoint)
  http.patch(
    `${API_BASE}/projects/:projectId/properties/:propertyId`,
    async ({ request, params }) => {
      const body = (await request.json()) as Record<string, unknown>;
      lastRequests.property = body;
      return HttpResponse.json({
        id: params.propertyId,
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

  // -------- TENANCIES SERVICE HANDLERS --------

  // GET all tenancies
  http.get(`${API_BASE}/tenancies`, () => {
    return HttpResponse.json(
      {
        tenancies: [
          {
            id: 't1',
            rentalStart: new Date().toISOString(),
            rentalEnd: new Date().toISOString(),
            tenants: [{
 id: 'u1', name: 'Max Mustermann', email: 'max@example.com'
}],
            listOfUnits: [{ id: 'unit1', title: 'Unit 1' }],
            active: true,
          },
          {
            id: 't2',
            rentalStart: new Date().toISOString(),
            rentalEnd: new Date().toISOString(),
            tenants: [],
            listOfUnits: [],
            active: true,
          },
        ],
      },
      { status: 200 },
    );
  }),

  // PATCH update tenancy
  http.patch(`${API_BASE}/tenancies/:tenancyId`, async ({ request, params }) => {
    lastRequests.tenancy = (await request.json()) as Record<string, unknown> | null;
    return HttpResponse.json({ id: params.tenancyId, ...lastRequests.tenancy }, { status: 200 });
  }),

  // DELETE tenancy
  http.delete(`${API_BASE}/tenancies/:tenancyId`, ({ params }) => {
    return HttpResponse.json({ success: true, id: params.tenancyId }, { status: 200 });
  }),

  // GET single apartment
  http.get(
    `${API_BASE}/projects/:projectId/buildings/:buildingId/apartments/:apartmentId`,
    ({ params }) => {
      return HttpResponse.json({
        id: params.apartmentId,
        title: 'Initial Apartment Title',
        description: 'Initial Apartment Description',
        livingSpace: 100,
        usableSpace: 80,
        heatingSpace: 60,
        location: 'Initial Location',
      });
    },
  ),

  // PATCH update apartment
  http.patch(
    `${API_BASE}/projects/:projectId/buildings/:buildingId/apartments/:apartmentId`,
    async ({ request, params }) => {
      lastRequests.apartment = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({
        id: params.apartmentId,
        ...lastRequests.apartment,
      });
    },
  ),

  // POST create apartment
  http.post(
    `${API_BASE}/projects/:projectId/buildings/:buildingId/apartments`,
    async ({ request, params }) => {
      const body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({
        id: 'new-apartment-id',
        projectId: params.projectId,
        buildingId: params.buildingId,
        ...body,
      });
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
    if (params.siteId === 'not-found') {
      return HttpResponse.json({ message: 'Site not found' }, { status: 404 });
    }
    return HttpResponse.json({
      id: params.siteId,
      title: 'New Site',
      description: 'A description of the new site.',
      space: 1000,
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
      lastRequests.createdSite = (await request.json()) as Record<string, unknown> | null;
      return HttpResponse.json({
        id: 'new-site-id',
        projectId: params.projectId,
        propertyId: params.propertyId,
        ...(lastRequests.createdSite ?? {}),
      });
    },
  ),

  // PATCH update site
  http.patch(`${API_BASE}/projects/:projectId/sites/:siteId`, async ({ request, params }) => {
    lastRequests.updatedSite = (await request.json()) as Record<string, unknown> | null;
    return HttpResponse.json({
      id: params.siteId,
      ...(lastRequests.updatedSite ?? {}),
    });
  }),

  // DELETE site
  http.delete(`${API_BASE}/projects/:projectId/sites/:siteId`, ({ params }) => {
    if (params.siteId === 'cannot-delete') {
      return HttpResponse.json({ message: 'Cannot delete' }, { status: 403 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

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
    lastRequests.createdTask = { ...(body ?? {}), id: 'new-task-id' };
    return HttpResponse.json(lastRequests.createdTask);
  }),

  // PATCH modify task
  http.patch(`${API_BASE}/projects/:projectId/tasks/:taskId`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown> | undefined;
    lastRequests.updatedTask = { id: params.taskId, ...(body ?? {}) };
    return HttpResponse.json(lastRequests.updatedTask);
  }),

  // -------- INBOX SERVICE HANDLERS --------

  // GET inbox messages
  http.get(`${API_BASE}/inbox`, () => {
    return HttpResponse.json({
      messages: [
        {
          id: '1',
          type: 'Nachricht',
          contractor: 'Bau GmbH',
          project: 'Neubau Musterstraße',
          unit: 'Wohnung 101',
          tenant: 'Max Müller',
          owner: 'Immobilien AG',
          senderName: 'Max Mustermann',
          senderEmail: 'max.mustermann@example.com',
          subject: 'Kücheninstallation abgeschlossen',
          body: 'Die Installation der Küche in Wohnung 101 wurde erfolgreich abgeschlossen.',
          receivedAt: new Date('2025-06-01T10:15:00').toISOString(),
          isRead: false,
        },
        {
          id: '2',
          type: 'Rechnung',
          contractor: 'Sanitär AG',
          project: 'Neubau Musterstraße',
          unit: 'Wohnung 102',
          tenant: 'Irene Schmidt',
          owner: 'Immobilien AG',
          senderName: 'Erika Musterfrau',
          senderEmail: 'erika.musterfrau@example.com',
          subject: 'Rechnung für Badezimmerarbeiten Mai 2025',
          body: 'Anbei findest du die aktuelle Rechnung für Mai 2025.',
          receivedAt: new Date('2025-05-28T14:30:00').toISOString(),
          isRead: false,
        },
        {
          id: '3',
          type: 'Nachricht',
          contractor: 'Facility Service GmbH',
          project: 'Campus Treskowallee',
          unit: 'Büro A029',
          tenant: 'HTW Berlin',
          owner: 'Campus Management GmbH',
          senderName: 'System-Benachrichtigung',
          senderEmail: 'noreply@remsfal.de',
          subject: 'Wartungsarbeiten geplant',
          body: 'Am 2025-06-10 findet eine Systemwartung von 01:00 bis 03:00 Uhr statt.',
          receivedAt: new Date('2025-05-25T08:00:00').toISOString(),
          isRead: true,
        },
        {
          id: '4',
          type: 'Nachricht',
          contractor: 'Bau GmbH',
          project: 'Neubau Musterstraße',
          unit: 'Wohnung 202',
          tenant: 'Bernd Beispiel',
          owner: 'Immobilien AG',
          senderName: 'Johannes Beispiel',
          senderEmail: 'johannes.beispiel@example.com',
          subject: 'Frage zum Objekt „Wohnung 202"',
          body: 'Hallo, ich habe eine Frage zu den notwendigen Wartungsarbeiten.',
          receivedAt: new Date('2025-05-20T09:45:00').toISOString(),
          isRead: false,
        },
        {
          id: '5',
          type: 'Rechnung',
          contractor: 'Elektro AG',
          project: 'Campus Treskowallee',
          unit: 'Raum A002',
          tenant: 'HTW Berlin',
          owner: 'Campus Management GmbH',
          senderName: 'Maria Beispiel',
          senderEmail: 'maria.beispiel@example.com',
          subject: 'Rechnung für Elektroarbeiten April 2025',
          body: 'Die Rechnung für die Elektroarbeiten im April 2025 findest du im Anhang.',
          receivedAt: new Date('2025-05-18T11:20:00').toISOString(),
          isRead: false,
        },
        {
          id: '6',
          type: 'Nachricht',
          contractor: 'Sicherheit GmbH',
          project: 'Campus Treskowallee',
          unit: 'Raum A008',
          tenant: 'HTW Berlin',
          owner: 'Campus Management GmbH',
          senderName: 'Sicherheitsdienst',
          senderEmail: 'security@facility.de',
          subject: 'Alarm: Rauchmelder ausgelöst',
          body: 'Im Raum A008 wurde um 22:30 Uhr der Rauchmelder ausgelöst.',
          receivedAt: new Date('2025-05-15T22:31:00').toISOString(),
          isRead: true,
        },
        {
          id: '7',
          type: 'Nachricht',
          contractor: 'Facility Service GmbH',
          project: 'Neubau Musterstraße',
          unit: 'Wohnung 101',
          tenant: 'Max Müller',
          owner: 'Immobilien AG',
          senderName: 'Lisa Beispiel',
          senderEmail: 'lisa.beispiel@example.com',
          subject: 'Meeting Protokoll',
          body: 'Das Protokoll des Meetings vom 10.05.2025 findest du im Anhang.',
          receivedAt: new Date('2025-05-12T16:00:00').toISOString(),
          isRead: false,
        },
      ],
    });
  }),

  // -------- TICKETING SERVICE HANDLERS --------

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

  // -------- BUILDINGS HANDLERS (additional) --------

  // GET building
  http.get(`${API_BASE}/projects/:projectId/buildings/:buildingId`, ({ params }) => {
    if (params.buildingId === 'not-found') {
      return HttpResponse.json({ message: 'Building not found' }, { status: 404 });
    }
    return HttpResponse.json({
      id: params.buildingId,
      title: 'Building ' + params.buildingId,
      description: 'A sample building',
      livingSpace: 500,
      commercialSpace: 100,
      usableSpace: 550,
      heatingSpace: 480,
      rent: 5000,
    });
  }),

  // POST create building
  http.post(`${API_BASE}/projects/:projectId/properties/:propertyId/buildings`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: 'new-building-id',
      ...body,
    });
  }),

  // PATCH update building
  http.patch(`${API_BASE}/projects/:projectId/buildings/:buildingId`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: params.buildingId,
      ...body,
    });
  }),

  // DELETE building
  http.delete(`${API_BASE}/projects/:projectId/buildings/:buildingId`, ({ params }) => {
    if (params.buildingId === 'cannot-delete') {
      return HttpResponse.json({ message: 'Cannot delete' }, { status: 403 });
    }
    return HttpResponse.json({}, { status: 204 });
  }),

  // -------- PROJECTS HANDLERS (additional) --------

  // GET projects list
  http.get(`${API_BASE}/projects`, ({ request }) => {
    const url = new URL(request.url);
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    return HttpResponse.json({
      projects: [
        {
          id: 'project-1',
          title: 'Project 1',
          description: 'Test project 1',
          memberRole: 'MANAGER',
        },
        {
          id: 'project-2',
          title: 'Project 2',
          description: 'Test project 2',
          memberRole: 'CONTRACTOR',
        },
      ],
      offset,
      limit,
      total: 2,
    });
  }),

  // GET single project
  http.get(`${API_BASE}/projects/:projectId`, ({ params }) => {
    if (params.projectId === 'not-found' || params.projectId === 'non-existing' || params.projectId === 'non-existent-project-id') {
      return HttpResponse.json({ message: 'Project not found' }, { status: 404 });
    }
    if (params.projectId === 'network-error-project-id') {
      return HttpResponse.json({ message: 'Network Error' }, { status: 500 });
    }
    return HttpResponse.json({
      id: params.projectId,
      title: 'Project ' + params.projectId,
      description: 'Test project description',
      memberRole: 'MANAGER',
    });
  }),

  // POST create project
  http.post(`${API_BASE}/projects`, async ({ request }) => {
    const body = (await request.json()) as { title: string };
    return HttpResponse.json({
      id: 'new-project-id',
      title: body.title,
      memberRole: 'MANAGER',
    });
  }),

  // PATCH update project
  http.patch(`${API_BASE}/projects/:projectId`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: params.projectId,
      ...body,
    });
  }),

  // DELETE project
  http.delete(`${API_BASE}/projects/:projectId`, () => {
    return HttpResponse.json({}, { status: 204 });
  }),

  // -------- APARTMENTS HANDLERS (additional) --------

  // GET apartment
  http.get(`${API_BASE}/projects/:projectId/apartments/:apartmentId`, ({ params }) => {
    if (params.apartmentId === 'not-found') {
      return HttpResponse.json({ message: 'Apartment not found' }, { status: 404 });
    }
    return HttpResponse.json({
      id: params.apartmentId,
      title: 'Apartment ' + params.apartmentId,
      description: 'A sample apartment',
      livingSpace: 100,
      usableSpace: 80,
      heatingSpace: 60,
      location: 'Floor 2',
    });
  }),

  // PATCH update apartment (without buildingId in path)
  http.patch(`${API_BASE}/projects/:projectId/apartments/:apartmentId`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: params.apartmentId,
      ...body,
    });
  }),

  // DELETE apartment
  http.delete(`${API_BASE}/projects/:projectId/apartments/:apartmentId`, ({ params }) => {
    if (params.apartmentId === 'cannot-delete') {
      return HttpResponse.json({ message: 'Cannot delete' }, { status: 403 });
    }
    return HttpResponse.json({}, { status: 204 });
  }),
];
