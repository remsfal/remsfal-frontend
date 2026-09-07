import { apiClient, type ApiComponents, type Readable } from '@/services/ApiClient';

export type QuotationRequestJson = Readable<ApiComponents['schemas']['QuotationRequestJson']>;
export type QuotationRequestListJson = Readable<ApiComponents['schemas']['QuotationRequestListJson']>;

class QuotationRequestService {
  async getContractorQuotationRequests(): Promise<QuotationRequestListJson> {
    return apiClient.get('/ticketing/v1/order-management/quotation-requests');
  }
}

export const quotationRequestService = new QuotationRequestService();
