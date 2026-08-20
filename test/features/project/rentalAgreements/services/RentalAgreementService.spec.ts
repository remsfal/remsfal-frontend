import { describe, test, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../mocks/server';
import RentalAgreementService from '@/features/project/rentalAgreements/services/RentalAgreementService';

describe('RentalAgreementService', () => {
  const service = new RentalAgreementService();
  const testProjectId = 'project-1';

  test('getRentalAgreements returns array', async () => {
    const agreements = await service.getRentalAgreements(testProjectId);
    expect(Array.isArray(agreements)).toBe(true);
  });

  test('getRentalAgreements falls back to an empty array when rentalAgreements field is missing', async () => {
    server.use(
      http.get(`/api/v1/projects/${testProjectId}/rental-agreements`, () => HttpResponse.json({})),
    );

    const agreements = await service.getRentalAgreements(testProjectId);
    expect(agreements).toEqual([]);
  });

  test('getRentalAgreements forwards rentalUnitId and rentalUnitType as query params', async () => {
    let capturedUrl: URL | undefined;
    server.use(
      http.get(`/api/v1/projects/${testProjectId}/rental-agreements`, ({ request }) => {
        capturedUrl = new URL(request.url);
        return HttpResponse.json({ rentalAgreements: [] });
      }),
    );

    await service.getRentalAgreements(testProjectId, {
      rentalUnitId: 'unit-1',
      rentalUnitType: 'SITE',
    });

    expect(capturedUrl?.searchParams.get('rentalUnitId')).toBe('unit-1');
    expect(capturedUrl?.searchParams.get('rentalUnitType')).toBe('SITE');
  });

  test('getRentalAgreements omits rentalUnitId/rentalUnitType from query when not provided', async () => {
    let capturedUrl: URL | undefined;
    server.use(
      http.get(`/api/v1/projects/${testProjectId}/rental-agreements`, ({ request }) => {
        capturedUrl = new URL(request.url);
        return HttpResponse.json({ rentalAgreements: [] });
      }),
    );

    await service.getRentalAgreements(testProjectId);

    expect(capturedUrl?.searchParams.has('rentalUnitId')).toBe(false);
    expect(capturedUrl?.searchParams.has('rentalUnitType')).toBe(false);
  });

  test('getRentalAgreement returns single agreement', async () => {
    const agreementId = 'agreement-1';
    const agreement = await service.getRentalAgreement(testProjectId, agreementId);
    expect(agreement).toBeDefined();
  });

  test('createRentalAgreement resolves successfully', async () => {
    const newAgreement = {
      startOfRental: '2024-01-01',
      endOfRental: '2024-12-31',
    };
    await expect(
      service.createRentalAgreement(testProjectId, newAgreement),
    ).resolves.toBeUndefined();
  });

  test('updateRentalAgreement resolves successfully', async () => {
    const updates = { startOfRental: '2024-02-01' };
    await expect(
      service.updateRentalAgreement(testProjectId, 'agreement-1', updates),
    ).resolves.toBeUndefined();
  });

  test('deleteRentalAgreement resolves successfully', async () => {
    await expect(
      service.deleteRentalAgreement(testProjectId, 'agreement-1'),
    ).resolves.toBeUndefined();
  });

  test('deleteRentalAgreement rejects when deletion fails', async () => {
    await expect(
      service.deleteRentalAgreement(testProjectId, 'cannot-delete'),
    ).rejects.toThrow();
  });

  test('addTenant resolves with the created tenant', async () => {
    server.use(
      http.post(
        `/api/v1/projects/${testProjectId}/rental-agreements/agreement-1/tenants`,
        async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({ id: 'new-tenant-id', ...body }, { status: 201 });
        },
      ),
    );

    const tenant = { firstName: 'New', lastName: 'Tenant' };
    const created = await service.addTenant(testProjectId, 'agreement-1', tenant);
    expect(created).toMatchObject(tenant);
    expect(created.id).toBeDefined();
  });

  test('addTenant rejects when the rental agreement does not exist', async () => {
    server.use(
      http.post(
        `/api/v1/projects/${testProjectId}/rental-agreements/not-found/tenants`,
        () => HttpResponse.json({ message: 'Rental agreement not found' }, { status: 404 }),
      ),
    );

    await expect(
      service.addTenant(testProjectId, 'not-found', { firstName: 'New', lastName: 'Tenant' }),
    ).rejects.toThrow();
  });

  test('removeTenant resolves successfully', async () => {
    server.use(
      http.delete(
        `/api/v1/projects/${testProjectId}/rental-agreements/agreement-1/tenants/tenant-1`,
        () => HttpResponse.json({}, { status: 204 }),
      ),
    );

    await expect(
      service.removeTenant(testProjectId, 'agreement-1', 'tenant-1'),
    ).resolves.toBeUndefined();
  });

  test('removeTenant rejects when removal fails', async () => {
    server.use(
      http.delete(
        `/api/v1/projects/${testProjectId}/rental-agreements/agreement-1/tenants/cannot-delete`,
        () => HttpResponse.json({ message: 'Cannot delete' }, { status: 403 }),
      ),
    );

    await expect(
      service.removeTenant(testProjectId, 'agreement-1', 'cannot-delete'),
    ).rejects.toThrow();
  });
});
