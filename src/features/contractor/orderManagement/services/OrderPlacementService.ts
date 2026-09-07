import { apiClient, type ApiComponents, type Readable } from '@/services/ApiClient';

export type OrderPlacementJson = Readable<ApiComponents['schemas']['OrderPlacementJson']>;
export type OrderPlacementListJson = Readable<ApiComponents['schemas']['OrderPlacementListJson']>;

class OrderPlacementService {
  async getOrderPlacements(): Promise<OrderPlacementListJson> {
    return apiClient.get('/ticketing/v1/order-management/order-placements');
  }

  async updateOrderPlacementStatus(
    placementId: string,
    status: Extract<OrderPlacementJson['status'], 'CONFIRMED' | 'REJECTED'>,
  ): Promise<OrderPlacementJson> {
    const path = '/ticketing/v1/order-management/order-placements/{placementId}';
    return apiClient.patch(path, { status }, { pathParams: { placementId } }) as Promise<OrderPlacementJson>;
  }
}

export const orderPlacementService = new OrderPlacementService();
