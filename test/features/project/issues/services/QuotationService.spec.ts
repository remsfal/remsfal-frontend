import { describe, test, expect } from 'vitest';
import { quotationService } from '@/features/project/issues/services/QuotationService';

describe('QuotationService with MSW', () => {
  test('getQuotations returns list with items array', async () => {
    const result = await quotationService.getQuotations('issue-1');
    expect(result.items).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.items!.length).toBeGreaterThan(0);
  });

  test('getQuotations returns item with expected fields', async () => {
    const result = await quotationService.getQuotations('issue-1');
    const item = result.items![0]!;
    expect(item.contractorName).toBe('ACME GmbH');
    expect(item.status).toBe('VALID');
  });
});
