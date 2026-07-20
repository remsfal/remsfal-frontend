import { describe, test, expect } from 'vitest';
import { orderPlacementService } from '@/services/OrderPlacementService';

describe('OrderPlacementService with MSW', () => {
  test('placeOrder resolves with created order placement', async () => {
    const result = await orderPlacementService.placeOrder('issue-1', 'q-1');
    expect(result.id).toBe('op-1');
    expect(result.status).toBe('PLACED');
  });
});
