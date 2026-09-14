import { apiClient, type ApiComponents, type Readable } from '@/services/ApiClient';

export type OrderPlacementJson = Readable<ApiComponents['schemas']['OrderPlacementJson']>;
export type OrderPlacementListJson = Readable<ApiComponents['schemas']['OrderPlacementListJson']>;

class OrderPlacementService {
  async placeOrder(issueId: string, quotationId: string): Promise<OrderPlacementJson> {
    // requestBody?: never for this endpoint — same cast precedent as IssueService.createIssueRelation
    const path = '/ticketing/v1/issues/{issueId}/quotations/{quotationId}/orders';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return apiClient.post(path, undefined as any, { pathParams: { issueId, quotationId } }) as Promise<OrderPlacementJson>;
  }

  async getOrders(issueId: string): Promise<Required<OrderPlacementListJson>> {
    const result = await apiClient.get('/ticketing/v1/issues/{issueId}/orders', { pathParams: { issueId } });
    return { items: result.items ?? [] };
  }
}

export const orderPlacementService = new OrderPlacementService();
