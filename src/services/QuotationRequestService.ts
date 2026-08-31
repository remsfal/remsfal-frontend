import { apiClient, type ApiComponents, type Readable } from '@/services/ApiClient';

export type QuotationRequestJson = Readable<ApiComponents['schemas']['QuotationRequestJson']>;
export type QuotationRequestListJson = Readable<ApiComponents['schemas']['QuotationRequestListJson']>;
export type CreateQuotationRequestJson = Readable<ApiComponents['schemas']['CreateQuotationRequestJson']>;

class QuotationRequestService {
  async getQuotationRequests(issueId: string): Promise<QuotationRequestListJson> {
    return apiClient.get('/ticketing/v1/issues/{issueId}/quotation-request', {pathParams: { issueId },});
  }

  async createQuotationRequest(issueId: string, data: CreateQuotationRequestJson): Promise<void> {
    // `contractors` here references existing contractors by id, unlike a create-contractor payload,
    // so the generic Writable<> body typing (which strips ContractorJson's readOnly id) doesn't apply.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await apiClient.post('/ticketing/v1/issues/{issueId}/quotation-request', data as any, {pathParams: { issueId },});
  }

  async getContractorQuotationRequests(): Promise<QuotationRequestListJson> {
    return apiClient.get('/ticketing/v1/order-management/quotation-requests');
  }
}

export const quotationRequestService = new QuotationRequestService();
