import { describe, test, expect } from 'vitest';
import { tenancyService } from '@/services/TenancyService';

describe('TenancyService with MSW', () => {
  test('getTenancies returns all tenancies', async () => {
    const tenancies = await tenancyService.getTenancies();
    expect(Array.isArray(tenancies)).toBe(true);
    if (tenancies.length > 0) {
      expect(tenancies[0]).toHaveProperty('id');
      expect(tenancies[0]).toHaveProperty('rentalUnits');
    }
  });

  test('getTenancies handles empty response', async () => {
    const tenancies = await tenancyService.getTenancies();
    expect(Array.isArray(tenancies)).toBe(true);
  });
});
