import { http, HttpResponse } from 'msw';
import { lastRequests } from '../test-helpers';

const API_BASE = '/api/v1';

export const tenancyHandlers = [
  // GET all tenancies (tenant context)
  http.get(`${API_BASE}/tenancies`, () => {
    return HttpResponse.json(
      {
        tenancies: [
          {
            id: 't1',
            rentalType: 'APARTMENT',
            rentalTitle: 'Apartment 101',
            startOfRental: new Date().toISOString(),
            endOfRental: new Date().toISOString(),
            active: true,
            basicRent: 1000,
            operatingCostsPrepayment: 200,
            heatingCostsPrepayment: 150
          },
          {
            id: 't2',
            rentalType: 'PROPERTY',
            rentalTitle: 'Property A',
            startOfRental: new Date().toISOString(),
            endOfRental: new Date().toISOString(),
            active: true,
            basicRent: 2000,
            operatingCostsPrepayment: 400,
            heatingCostsPrepayment: 300
          },
        ],
      },
      { status: 200 },
    );
  }),

  // PATCH update tenancy
  http.patch(`${API_BASE}/tenancies/:tenancyId`, async ({ request, params }) => {
    lastRequests.tenancy = (await request.json()) as Record<string, unknown> | null;
    return HttpResponse.json({ id: params.tenancyId, ...lastRequests.tenancy }, { status: 200 });
  }),

  // DELETE tenancy
  http.delete(`${API_BASE}/tenancies/:tenancyId`, ({ params }) => {
    return HttpResponse.json({ success: true, id: params.tenancyId }, { status: 200 });
  }),
];
