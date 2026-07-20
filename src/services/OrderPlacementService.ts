import { apiClient, type ApiComponents } from '@/services/ApiClient';

export type OrderPlacementJson = ApiComponents['schemas']['OrderPlacementJson'];

class OrderPlacementService {
  async placeOrder(issueId: string, quotationId: string): Promise<OrderPlacementJson> {
    // requestBody?: never for this endpoint — same cast precedent as IssueService.createIssueRelation
    const path = '/ticketing/v1/issues/{issueId}/quotations/{quotationId}/order-placement';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return apiClient.post(path, undefined as any, { pathParams: { issueId, quotationId } }) as Promise<OrderPlacementJson>;
  }
}

export const orderPlacementService = new OrderPlacementService();
