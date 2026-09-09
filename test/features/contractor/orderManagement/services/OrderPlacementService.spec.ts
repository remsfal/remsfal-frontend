import { describe, test, expect } from 'vitest';
import { orderPlacementService } from '@/features/contractor/orderManagement/services/OrderPlacementService';

describe('OrderPlacementService with MSW', () => {
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
