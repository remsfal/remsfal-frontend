import { describe, test, expect } from 'vitest';
import { quotationRequestService } from '@/features/contractor/orderManagement/services/QuotationRequestService';

describe('QuotationRequestService with MSW', () => {
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
