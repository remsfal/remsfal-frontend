import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';

export type QuotationRequestJson = ApiComponents['schemas']['QuotationRequestJson'];
export type QuotationRequestListJson = ApiComponents['schemas']['QuotationRequestListJson'];
export type CreateQuotationRequestJson = ApiComponents['schemas']['CreateQuotationRequestJson'];

class QuotationRequestService {
  async getQuotationRequests(issueId: string): Promise<QuotationRequestListJson> {
    return apiClient.get('/ticketing/v1/issues/{issueId}/quotation-request', {
      pathParams: { issueId },
    });
  }

  async createQuotationRequest(issueId: string, data: CreateQuotationRequestJson): Promise<void> {
    await apiClient.post('/ticketing/v1/issues/{issueId}/quotation-request', data, {
      pathParams: { issueId },
    });
  }
}

export const quotationRequestService = new QuotationRequestService();
