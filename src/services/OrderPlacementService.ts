import { apiClient, type ApiComponents } from '@/services/ApiClient';

export type OrderPlacementJson = ApiComponents['schemas']['OrderPlacementJson'];
export type OrderPlacementListJson = ApiComponents['schemas']['OrderPlacementListJson'];

class OrderPlacementService {
  async placeOrder(issueId: string, quotationId: string): Promise<OrderPlacementJson> {
    // requestBody?: never for this endpoint — same cast precedent as IssueService.createIssueRelation
    const path = '/ticketing/v1/issues/{issueId}/quotations/{quotationId}/order-placement';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return apiClient.post(path, undefined as any, { pathParams: { issueId, quotationId } }) as Promise<OrderPlacementJson>;
  }

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
