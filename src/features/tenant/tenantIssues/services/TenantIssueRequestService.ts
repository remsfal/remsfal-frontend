import { apiClient, type ApiComponents, type Readable, type Writable } from '@/services/ApiClient';

export type IssueRequestJson = Readable<ApiComponents['schemas']['IssueRequestJson']>;
export type IssueRequestWritableJson = Writable<ApiComponents['schemas']['IssueRequestJson']>;

class TenantIssueRequestService {
  async getRequests(issueId: string): Promise<IssueRequestJson[]> {
    const result = await apiClient.get(
      '/ticketing/v1/tenant-relations/issues/{issueId}/requests',
      { pathParams: { issueId } },
    );
    return result.requests ?? [];
  }

  async answerRequest(
    issueId: string,
    issueRequestId: string,
    response: IssueRequestWritableJson,
    files: File[],
  ): Promise<void> {
    const formData = new FormData();
    formData.append('response', new Blob([JSON.stringify(response)], { type: 'application/json' }));

    files.forEach((file) => {
      formData.append('attachment', file);
    });

    await apiClient.post(
      '/ticketing/v1/tenant-relations/issues/{issueId}/requests/{issueRequestId}/response',
      formData as never,
      { pathParams: { issueId, issueRequestId } },
    );
  }
}

export const tenantIssueRequestService = new TenantIssueRequestService();
