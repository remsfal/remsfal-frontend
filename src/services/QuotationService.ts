import { apiClient, type ApiComponents } from '@/services/ApiClient';

export type QuotationJson = ApiComponents['schemas']['QuotationJson'];
export type QuotationListJson = ApiComponents['schemas']['QuotationListJson'];

class QuotationService {
  async getQuotations(issueId: string): Promise<QuotationListJson> {
    return apiClient.get('/ticketing/v1/issues/{issueId}/quotations', {pathParams: { issueId },});
  }
}

export const quotationService = new QuotationService();
