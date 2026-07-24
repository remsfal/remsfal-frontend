import { describe, test, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../mocks/server';
import RentalAgreementService from '@/features/project/rentalAgreements/services/RentalAgreementService';

describe('RentalAgreementService', () => {
  const service = new RentalAgreementService();
  const testProjectId = 'project-1';

  test('fetchRentalAgreements returns array', async () => {
    const agreements = await service.fetchRentalAgreements(testProjectId);
    expect(Array.isArray(agreements)).toBe(true);
  });

  test('fetchRentalAgreements falls back to an empty array when rentalAgreements field is missing', async () => {
    server.use(
      http.get(`/api/v1/projects/${testProjectId}/rental-agreements`, () => HttpResponse.json({})),
    );

    const agreements = await service.fetchRentalAgreements(testProjectId);
    expect(agreements).toEqual([]);
  });

  test('loadRentalAgreement returns single agreement', async () => {
    // This will need MSW handler
    const agreementId = 'agreement-1';
    const agreement = await service.loadRentalAgreement(testProjectId, agreementId);
    expect(agreement).toBeDefined();
  });

  test('extractTenants returns flattened tenant list', () => {
    const agreements = [
      {
        id: 'a1',
        tenants: [
          {
            firstName: 'John', lastName: 'Doe', email: 'john@example.com' 
          },
          {
            firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' 
          }
        ]
      },
      {
        id: 'a2',
        tenants: [
          {
            firstName: 'Bob', lastName: 'Smith', email: 'bob@example.com' 
          }
        ]
      }
    ];

    const tenants = service.extractTenants(agreements);
    expect(tenants).toHaveLength(3);
    expect(tenants[0].firstName).toBe('John');
    expect(tenants[2].firstName).toBe('Bob');
  });

  test('extractTenants handles empty arrays', () => {
    const tenants = service.extractTenants([]);
    expect(tenants).toEqual([]);
  });

  test('extractTenants handles agreements without tenants', () => {
    const agreements = [{ id: 'a1' }, { id: 'a2' }];
    const tenants = service.extractTenants(agreements);
    expect(tenants).toEqual([]);
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
    const tenant = { firstName: 'New', lastName: 'Tenant' };
    const created = await service.addTenant(testProjectId, 'agreement-1', tenant);
    expect(created).toMatchObject(tenant);
    expect(created.id).toBeDefined();
  });

  test('addTenant rejects when the rental agreement does not exist', async () => {
    await expect(
      service.addTenant(testProjectId, 'not-found', { firstName: 'New', lastName: 'Tenant' }),
    ).rejects.toThrow();
  });

  test('removeTenant resolves successfully', async () => {
    await expect(
      service.removeTenant(testProjectId, 'agreement-1', 'tenant-1'),
    ).resolves.toBeUndefined();
  });

  test('removeTenant rejects when removal fails', async () => {
    await expect(
      service.removeTenant(testProjectId, 'agreement-1', 'cannot-delete'),
    ).rejects.toThrow();
  });
});
