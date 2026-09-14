import { describe, test, expect } from 'vitest';
import { orderPlacementService } from '@/features/project/issues/services/OrderPlacementService';

describe('OrderPlacementService with MSW', () => {
  test('placeOrder resolves with created order placement', async () => {
    const result = await orderPlacementService.placeOrder('issue-1', 'q-1');
    expect(result.id).toBe('op-1');
    expect(result.status).toBe('PLACED');
  });

  test('getOrders resolves with orders placed for the issue', async () => {
    const result = await orderPlacementService.getOrders('issue-1');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].organizationId).toBe('org-1');
    expect(result.items[0].contractorName).toBe('ACME GmbH');
  });
});
