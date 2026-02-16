import { http, HttpResponse } from 'msw';
import { lastRequests } from '../test-helpers';

const API_BASE = '/api/v1';

export const propertyHandlers = [
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
];
