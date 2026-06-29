import { describe, test, expect } from 'vitest';
import { quotationRequestService } from '@/services/QuotationRequestService';

describe('QuotationRequestService with MSW', () => {
  test('getQuotationRequests returns list with items array', async () => {
    const result = await quotationRequestService.getQuotationRequests('issue-1');
    expect(result.items).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.items!.length).toBeGreaterThan(0);
  });

  test('getQuotationRequests returns item with expected fields', async () => {
    const result = await quotationRequestService.getQuotationRequests('issue-1');
    const item = result.items![0]!;
    expect(item.scopeOfWork).toBe('Dachrinne reparieren');
    expect(item.status).toBe('REQUESTED');
    expect(item.contractorId).toBe('contractor-1');
  });

  test('getQuotationRequests passes issueId in URL', async () => {
    const result = await quotationRequestService.getQuotationRequests('issue-42');
    expect(result.items).toBeDefined();
  });

  test('createQuotationRequest resolves without error', async () => {
    await expect(
      quotationRequestService.createQuotationRequest('issue-1', {
        scopeOfWork: 'Neue Heizung einbauen',
        contractors: [{ companyName: 'Test GmbH' }],
      }),
    ).resolves.not.toThrow();
  });

  test('createQuotationRequest resolves when scopeOfWork is omitted', async () => {
    await expect(
      quotationRequestService.createQuotationRequest('issue-1', {contractors: [{ companyName: 'Test GmbH' }],}),
    ).resolves.not.toThrow();
  });

  test('getContractorQuotationRequests returns list with items array', async () => {
    const result = await quotationRequestService.getContractorQuotationRequests();
    expect(result.items).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.items!.length).toBeGreaterThan(0);
  });

  test('getContractorQuotationRequests returns item with expected fields', async () => {
    const result = await quotationRequestService.getContractorQuotationRequests();
    const item = result.items![0]!;
    expect(item.scopeOfWork).toBe('Dachrinne reparieren');
    expect(item.status).toBe('REQUESTED');
    expect(item.contractorId).toBe('contractor-1');
  });
});
