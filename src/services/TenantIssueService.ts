import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';

export type TenantIssueJson = ApiComponents['schemas']['TenantIssueJson'];
export type TenantIssueListJson = ApiComponents['schemas']['TenantIssueListJson'];

class TenantIssueService {
  async getIssues(cursor?: string, limit = 100): Promise<TenantIssueListJson> {
    const result = await apiClient.get('/ticketing/v1/tenant-relations/issues', {
      params: {
        limit,
        ...(cursor ? { cursor } : {}),
      },
    }) as Partial<TenantIssueListJson>;
    return {
      size: result.size ?? 0,
      issues: result.issues ?? [],
      nextCursor: result.nextCursor,
    };
  }

  async getIssue(issueId: string): Promise<TenantIssueJson> {
    const path = '/ticketing/v1/tenant-relations/issues/{issueId}';
    return apiClient.get(path, { pathParams: { issueId } }) as Promise<TenantIssueJson>;
  }

  async createIssueWithAttachment(body: Partial<TenantIssueJson>, files: File[]): Promise<TenantIssueJson> {
    const formData = new FormData();

    formData.append('issue', new Blob([JSON.stringify(body)], { type: 'application/json' }));

    files.forEach((file) => {
      formData.append('attachment', file);
    });

    // Do NOT set Content-Type manually — axios/browser sets multipart/form-data with boundary automatically
    return apiClient.post('/ticketing/v1/tenant-relations/issues', formData as never) as Promise<TenantIssueJson>;
  }

  async closeIssue(issueId: string): Promise<void> {
    const path = '/ticketing/v1/tenant-relations/issues/{issueId}';
    return apiClient.delete(path, { pathParams: { issueId } });
  }
}

export const tenantIssueService = new TenantIssueService();
