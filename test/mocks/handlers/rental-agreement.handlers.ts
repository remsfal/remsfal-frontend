import { http, HttpResponse } from 'msw';

const API_BASE = '/api/v1';

export const rentalAgreementHandlers = [
  // GET all rental agreements for a project
  http.get(`${API_BASE}/projects/:projectId/rental-agreements`, () => {
    return HttpResponse.json({
      rentalAgreements: [
        {
          id: 'agreement-1',
          startOfRental: new Date('2024-01-01').toISOString(),
          endOfRental: new Date('2025-01-01').toISOString(),
          active: true,
          tenants: [
            {
              id: 'tenant-1', firstName: 'Max', lastName: 'Mustermann', email: 'max@example.com',
            },
            {
              id: 'tenant-2', firstName: 'Julia', lastName: 'Schmidt', email: 'julia@example.com',
            }
          ],
          apartmentRents: [
            {
              id: 'rent-1', rentalUnit: {
                id: 'unit-1', title: 'Apartment 1A', type: 'APARTMENT',
              },
            }
          ],
          propertyRents: [],
          siteRents: [],
          buildingRents: [],
          storageRents: [],
          commercialRents: []
        },
        {
          id: 'agreement-2',
          startOfRental: new Date('2024-06-01').toISOString(),
          endOfRental: new Date('2025-06-01').toISOString(),
          active: true,
          tenants: [
            {
              id: 'tenant-3', firstName: 'Bob', lastName: 'Smith', email: 'bob@example.com',
            }
          ],
          apartmentRents: [],
          propertyRents: [
            {
              id: 'rent-2', rentalUnit: {
                id: 'unit-2', title: 'Property A', type: 'PROPERTY',
              },
            }
          ],
          siteRents: [],
          buildingRents: [],
          storageRents: [],
          commercialRents: []
        }
      ]
    });
  }),

  // GET single rental agreement
  http.get(`${API_BASE}/projects/:projectId/rental-agreements/:agreementId`, ({ params }) => {
    if (params.agreementId === 'not-found') {
      return HttpResponse.json({ message: 'Rental agreement not found' }, { status: 404 });
    }
    return HttpResponse.json({
      id: params.agreementId,
      startOfRental: new Date('2024-01-01').toISOString(),
      endOfRental: new Date('2025-01-01').toISOString(),
      active: true,
      tenants: [
        {
          id: 'tenant-1', firstName: 'Max', lastName: 'Mustermann', email: 'max@example.com',
        }
      ],
      apartmentRents: [
        {
          id: 'rent-1', rentalUnit: {
            id: 'unit-1', title: 'Apartment 1A', type: 'APARTMENT',
          },
        }
      ],
      propertyRents: [],
      siteRents: [],
      buildingRents: [],
      storageRents: [],
      commercialRents: []
    });
  }),

  // POST create rental agreement
  http.post(`${API_BASE}/projects/:projectId/rental-agreements`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: 'new-agreement-id',
      ...body
    }, { status: 201 });
  }),

  // PATCH update rental agreement
  http.patch(`${API_BASE}/projects/:projectId/rental-agreements/:agreementId`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: params.agreementId,
      ...body
    });
  }),

  // DELETE rental agreement
  http.delete(`${API_BASE}/projects/:projectId/rental-agreements/:agreementId`, ({ params }) => {
    if (params.agreementId === 'cannot-delete') {
      return HttpResponse.json({ message: 'Cannot delete' }, { status: 403 });
    }
    return HttpResponse.json({}, { status: 204 });
  }),
];
