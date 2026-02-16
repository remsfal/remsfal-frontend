import { http, HttpResponse } from 'msw';
import { lastRequests } from '../test-helpers';

const API_BASE = '/api/v1';

export const apartmentHandlers = [
  // GET single apartment (with buildingId in path)
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

  // GET apartment (without buildingId in path)
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

  // PATCH update apartment (with buildingId in path)
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

  // PATCH update apartment (without buildingId in path)
  http.patch(`${API_BASE}/projects/:projectId/apartments/:apartmentId`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: params.apartmentId,
      ...body,
    });
  }),

  // DELETE apartment (with buildingId in path)
  http.delete(
    `${API_BASE}/projects/:projectId/buildings/:buildingId/apartments/:apartmentId`,
    () => {
      return HttpResponse.json({ success: true }, { status: 200 });
    },
  ),

  // DELETE apartment (without buildingId in path)
  http.delete(`${API_BASE}/projects/:projectId/apartments/:apartmentId`, ({ params }) => {
    if (params.apartmentId === 'cannot-delete') {
      return HttpResponse.json({ message: 'Cannot delete' }, { status: 403 });
    }
    return HttpResponse.json({}, { status: 204 });
  }),
];
