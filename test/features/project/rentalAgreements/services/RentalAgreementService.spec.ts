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
});
