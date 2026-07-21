import { http, HttpResponse } from 'msw';

const TICKETING_BASE = '/ticketing/v1';

export const mockQuotation = {
  id: 'q-1',
  issueId: 'issue-1',
  projectId: 'project-1',
  contractorId: 'contractor-1',
  contractorName: 'ACME GmbH',
  organizationId: 'org-1',
  status: 'VALID',
  createdAt: '2026-01-15T10:00:00Z',
  modifiedAt: '2026-01-15T10:00:00Z',
  validUntil: '2026-02-15T10:00:00Z',
};

export const mockOrderPlacement = {
  id: 'op-1',
  issueId: 'issue-1',
  projectId: 'project-1',
  contractorId: 'contractor-1',
  contractorName: 'ACME GmbH',
  quotationId: 'q-1',
  status: 'PLACED',
  createdAt: '2026-01-16T10:00:00Z',
  modifiedAt: '2026-01-16T10:00:00Z',
};

export const quotationHandlers = [
  http.get(`${TICKETING_BASE}/issues/:issueId/quotations`, () => {
    return HttpResponse.json({ items: [mockQuotation] }, { status: 200 });
  }),

  http.post(`${TICKETING_BASE}/issues/:issueId/quotations/:quotationId/order-placement`, () => {
    return HttpResponse.json(mockOrderPlacement, { status: 201 });
  }),

  http.get(`${TICKETING_BASE}/order-management/order-placements`, () => {
    return HttpResponse.json({ items: [mockOrderPlacement] }, { status: 200 });
  }),

  http.patch(`${TICKETING_BASE}/order-management/order-placements/:placementId`, async ({ request }) => {
    const body = (await request.json()) as { status: string };
    return HttpResponse.json({ ...mockOrderPlacement, status: body.status }, { status: 200 });
  }),
];
