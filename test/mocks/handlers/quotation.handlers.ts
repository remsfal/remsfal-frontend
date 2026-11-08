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
  organizationId: 'org-1',
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

  http.post(`${TICKETING_BASE}/issues/:issueId/quotations/:quotationId/orders`, () => {
    return HttpResponse.json(mockOrderPlacement, { status: 201 });
  }),

  http.get(`${TICKETING_BASE}/issues/:issueId/orders`, () => {
    return HttpResponse.json({ items: [mockOrderPlacement] }, { status: 200 });
  }),

  http.get(`${TICKETING_BASE}/order-management/order-placements`, ({ request }) => {
    // like the backend: repeated status params are combined with OR, no param returns all
    const statuses = new URL(request.url).searchParams.getAll('status');
    const items = [mockOrderPlacement].filter((p) => statuses.length === 0 || statuses.includes(p.status));
    return HttpResponse.json({ items }, { status: 200 });
  }),

  http.patch(`${TICKETING_BASE}/order-management/order-placements/:placementId`, async ({ request }) => {
    const body = (await request.json()) as { status: string };
    return HttpResponse.json({ ...mockOrderPlacement, status: body.status }, { status: 200 });
  }),
];
