import { http, HttpResponse } from 'msw';

const API_BASE = '/api/v1';

export const mockContractor = {
  id: 'contractor-1',
  projectId: 'project-1',
  companyName: 'Mustermann Bau GmbH',
  email: 'info@mustermann-bau.de',
  phone: '+4930123456',
  trade: 'Bauarbeiten',
  contactPerson: 'Max Mustermann',
  remarks: 'Zuverlässiger Partner',
};

export const contractorHandlers = [
  http.get(`${API_BASE}/projects/:projectId/contractors`, () => {
    return HttpResponse.json({ contractors: [mockContractor], total: 1 }, { status: 200 });
  }),

  http.post(`${API_BASE}/projects/:projectId/contractors`, () => {
    return new HttpResponse(null, { status: 201 });
  }),

  http.get(`${API_BASE}/projects/:projectId/contractors/:contractorId`, ({ params }) => {
    return HttpResponse.json(
      { ...mockContractor, id: params.contractorId, projectId: params.projectId },
      { status: 200 },
    );
  }),

  http.patch(`${API_BASE}/projects/:projectId/contractors/:contractorId`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...mockContractor, ...body, id: params.contractorId }, { status: 200 });
  }),

  http.delete(`${API_BASE}/projects/:projectId/contractors/:contractorId`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
