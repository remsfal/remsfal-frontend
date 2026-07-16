import { http, HttpResponse } from 'msw';
import { lastRequests } from '../test-helpers';

const API_BASE = '/api/v1';

export const siteHandlers = [
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
];
