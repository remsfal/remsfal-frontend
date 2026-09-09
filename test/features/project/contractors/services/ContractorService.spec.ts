import { describe, test, expect } from 'vitest';
import { contractorService } from '@/features/project/contractors/services/ContractorService';

describe('ContractorService with MSW', () => {
  test('getContractors returns list with contractors array', async () => {
    const result = await contractorService.getContractors('project-1');
    expect(result.contractors).toBeDefined();
    expect(Array.isArray(result.contractors)).toBe(true);
    expect(result.contractors!.length).toBeGreaterThan(0);
  });

  test('getContractors returns contractor with expected fields', async () => {
    const result = await contractorService.getContractors('project-1');
    const c = result.contractors![0]!;
    expect(c.name).toBe('Mustermann Bau GmbH');
    expect(c.email).toBe('info@mustermann-bau.de');
  });

  test('createContractor resolves without error', async () => {
    await expect(
      contractorService.createContractor('project-1', { name: 'Neue GmbH' }),
    ).resolves.not.toThrow();
  });

  test('getContractor returns contractor by id', async () => {
    const c = await contractorService.getContractor('project-1', 'contractor-1');
    expect(c.id).toBe('contractor-1');
    expect(c.name).toBeDefined();
  });

  test('updateContractor merges request body into response', async () => {
    const updated = await contractorService.updateContractor(
      'project-1', 'contractor-1', { name: 'Updated GmbH' },
    );
    expect(updated.name).toBe('Updated GmbH');
    expect(updated.id).toBe('contractor-1');
  });

  test('updateContractor preserves unchanged fields', async () => {
    const updated = await contractorService.updateContractor('project-1', 'contractor-1', {phone: '+4930999888',});
    expect(updated.phone).toBe('+4930999888');
    expect(updated.name).toBeDefined();
  });

  test('deleteContractor resolves without error', async () => {
    await expect(
      contractorService.deleteContractor('project-1', 'contractor-1'),
    ).resolves.not.toThrow();
  });
});
