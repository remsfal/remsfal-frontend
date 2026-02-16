import { http, HttpResponse } from 'msw';

const API_BASE = '/api/v1';

export const storageHandlers = [
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
];
