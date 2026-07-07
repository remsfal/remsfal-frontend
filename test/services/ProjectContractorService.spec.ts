import { describe, test, expect } from 'vitest';
import { projectContractorService } from '@/services/ProjectContractorService';

describe('ProjectContractorService with MSW', () => {
  test('getContractors returns list with contractors array', async () => {
    const result = await projectContractorService.getContractors('project-1');
    expect(result.contractors).toBeDefined();
    expect(Array.isArray(result.contractors)).toBe(true);
    expect(result.contractors!.length).toBeGreaterThan(0);
  });

  test('getContractors returns contractor with expected fields', async () => {
    const result = await projectContractorService.getContractors('project-1');
    const c = result.contractors![0]!;
    expect(c.companyName).toBe('Mustermann Bau GmbH');
    expect(c.email).toBe('info@mustermann-bau.de');
  });

  test('createContractor resolves without error', async () => {
    await expect(
      projectContractorService.createContractor('project-1', { companyName: 'Neue GmbH' }),
    ).resolves.not.toThrow();
  });

  test('getContractor returns contractor by id', async () => {
    const c = await projectContractorService.getContractor('project-1', 'contractor-1');
    expect(c.id).toBe('contractor-1');
    expect(c.companyName).toBeDefined();
  });

  test('updateContractor merges request body into response', async () => {
    const updated = await projectContractorService.updateContractor(
      'project-1', 'contractor-1', { companyName: 'Updated GmbH' },
    );
    expect(updated.companyName).toBe('Updated GmbH');
    expect(updated.id).toBe('contractor-1');
  });

  test('updateContractor preserves unchanged fields', async () => {
    const updated = await projectContractorService.updateContractor('project-1', 'contractor-1', {phone: '+4930999888',});
    expect(updated.phone).toBe('+4930999888');
    expect(updated.companyName).toBeDefined();
  });

  test('deleteContractor resolves without error', async () => {
    await expect(
      projectContractorService.deleteContractor('project-1', 'contractor-1'),
    ).resolves.not.toThrow();
  });
});
