import { describe, test, expect } from 'vitest';
import { orderPlacementService } from '@/services/OrderPlacementService';

describe('OrderPlacementService with MSW', () => {
  test('placeOrder resolves with created order placement', async () => {
    const result = await orderPlacementService.placeOrder('issue-1', 'q-1');
    expect(result.id).toBe('op-1');
    expect(result.status).toBe('PLACED');
  });

  test('getOrderPlacements resolves with order placements for the contractor', async () => {
    const result = await orderPlacementService.getOrderPlacements();
    expect(result.items).toHaveLength(1);
    expect(result.items?.[0].id).toBe('op-1');
  });

  test('updateOrderPlacementStatus resolves with the updated status', async () => {
    const result = await orderPlacementService.updateOrderPlacementStatus('op-1', 'CONFIRMED');
    expect(result.status).toBe('CONFIRMED');
  });
});
