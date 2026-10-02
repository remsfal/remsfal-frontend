import { apiClient, type ApiComponents, type Readable, type Writable } from '@/services/ApiClient';

export type IssueRequestJson = Readable<ApiComponents['schemas']['IssueRequestJson']>;
export type IssueRequestWritableJson = Writable<ApiComponents['schemas']['IssueRequestJson']>;

class IssueRequestService {
  async getRequests(issueId: string): Promise<IssueRequestJson[]> {
    const result = await apiClient.get('/ticketing/v1/order-management/{issueId}/requests', { pathParams: { issueId } });
    return result.requests ?? [];
  }

  async createRequest(issueId: string, request: IssueRequestWritableJson, files: File[] = []): Promise<void> {
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));

    files.forEach((file) => {
      formData.append('attachment', file);
    });

    await apiClient.post('/ticketing/v1/order-management/{issueId}/requests', formData, { pathParams: { issueId } });
  }

  async deleteRequest(issueId: string, requestId: string): Promise<void> {
    const pathParams = { issueId, requestId };
    await apiClient.delete('/ticketing/v1/order-management/{issueId}/requests/{requestId}', { pathParams });
  }
}

export const issueRequestService = new IssueRequestService();
