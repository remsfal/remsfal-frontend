import { http, HttpResponse } from 'msw';

const TICKETING_BASE = '/ticketing/v1';

export const mockQuotationRequest = {
  id: 'qr-1',
  issueId: 'issue-1',
  projectId: 'project-1',
  triggerId: 'user-1',
  contractorId: 'contractor-1',
  organizationId: 'org-1',
  scopeOfWork: 'Dachrinne reparieren',
  status: 'REQUESTED',
  createdAt: '2026-01-15T10:00:00Z',
  modifiedAt: '2026-01-15T10:00:00Z',
};

export const quotationRequestHandlers = [
  http.get(`${TICKETING_BASE}/issues/:issueId/quotation-request`, () => {
    return HttpResponse.json({ items: [mockQuotationRequest] }, { status: 200 });
  }),

  http.post(`${TICKETING_BASE}/issues/:issueId/quotation-request`, () => {
    return new HttpResponse(null, { status: 201 });
  }),

  http.get(`${TICKETING_BASE}/order-management/quotation-requests`, () => {
    return HttpResponse.json({ items: [mockQuotationRequest] }, { status: 200 });
  }),
];
