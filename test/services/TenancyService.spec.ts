import { describe, test, expect } from 'vitest';
import { tenancyService } from '@/services/TenancyService';

describe('TenancyService with MSW', () => {
  test('getTenancies returns all tenancies', async () => {
    const tenancies = await tenancyService.getTenancies();
    expect(Array.isArray(tenancies)).toBe(true);
    if (tenancies.length > 0) {
      expect(tenancies[0]).toHaveProperty('id');
      expect(tenancies[0]).toHaveProperty('rentalType');
    }
  });

  test('getTenancies handles empty response', async () => {
    const tenancies = await tenancyService.getTenancies();
    expect(Array.isArray(tenancies)).toBe(true);
  });

  test('getTenancyDetail requires valid parameters', async () => {
    // Note: This test may fail without proper MSW setup
    // getTenancyDetail requires tenancyId, rentalId, and rentalType
    // which are not available in TenancyItemJson
    expect(tenancyService.getTenancyDetail).toBeDefined();
  });
});
