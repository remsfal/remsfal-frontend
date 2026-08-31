import { apiClient, type ApiComponents, type Readable } from '@/services/ApiClient';

export type QuotationJson = Readable<ApiComponents['schemas']['QuotationJson']>;
export type QuotationListJson = Readable<ApiComponents['schemas']['QuotationListJson']>;

class QuotationService {
  async getQuotations(issueId: string): Promise<QuotationListJson> {
    return apiClient.get('/ticketing/v1/issues/{issueId}/quotations', {pathParams: { issueId },});
  }
}

export const quotationService = new QuotationService();
