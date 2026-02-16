import { http, HttpResponse } from 'msw';
import { lastRequests } from '../test-helpers';

const API_BASE = '/api/v1';

export const commercialHandlers = [
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
];
