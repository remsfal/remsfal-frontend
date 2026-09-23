import { apiClient, type ApiComponents, type Writable } from '@/services/ApiClient';

export type IssueRequestWritableJson = Writable<ApiComponents['schemas']['IssueRequestJson']>;

class IssueRequestService {
  async createRequest(issueId: string, request: IssueRequestWritableJson): Promise<void> {
    await apiClient.post('/ticketing/v1/order-management/{issueId}/requests', request, { pathParams: { issueId } });
  }
}

export const issueRequestService = new IssueRequestService();
