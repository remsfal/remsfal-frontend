import { http, HttpResponse } from 'msw';

const API_BASE = '/api/v1';

export const buildingHandlers = [
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
];
