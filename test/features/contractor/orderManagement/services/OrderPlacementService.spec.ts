import { describe, test, expect } from 'vitest';
import { orderPlacementService } from '@/features/contractor/orderManagement/services/OrderPlacementService';

describe('OrderPlacementService with MSW', () => {
  test('getOrderPlacements resolves with order placements for the contractor', async () => {
    const result = await orderPlacementService.getOrderPlacements();
    expect(result.items).toHaveLength(1);
    expect(result.items?.[0].id).toBe('op-1');
  });

  test('getOrderPlacements passes the status filter to the backend', async () => {
    const placed = await orderPlacementService.getOrderPlacements(['PLACED']);
    expect(placed.items).toHaveLength(1);

    const confirmed = await orderPlacementService.getOrderPlacements(['CONFIRMED']);
    expect(confirmed.items).toHaveLength(0);

    const combined = await orderPlacementService.getOrderPlacements(['CONFIRMED', 'PLACED']);
    expect(combined.items).toHaveLength(1);
  });

  test('updateOrderPlacementStatus resolves with the updated status', async () => {
    const result = await orderPlacementService.updateOrderPlacementStatus('op-1', 'CONFIRMED');
    expect(result.status).toBe('CONFIRMED');
  });
});
