import { apiClient, type ApiComponents, type Writable } from '@/services/ApiClient';

export type IssueRequestWritableJson = Writable<ApiComponents['schemas']['IssueRequestJson']>;

class IssueRequestService {
  async createRequest(issueId: string, request: IssueRequestWritableJson, files: File[] = []): Promise<void> {
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));

    files.forEach((file) => {
      formData.append('attachment', file);
    });

    await apiClient.post(
      '/ticketing/v1/order-management/{issueId}/requests',
      formData as never,
      { pathParams: { issueId } },
    );
  }
}

export const issueRequestService = new IssueRequestService();
