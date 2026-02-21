import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';

export type Status = ApiComponents['schemas']['IssueStatus'];
export type Type = ApiComponents['schemas']['IssueType'];
export type IssuePriority = ApiComponents['schemas']['IssuePriority'];
export type Issue = ApiComponents['schemas']['IssueJson'];
export type IssueItem = ApiComponents['schemas']['IssueItemJson'];
export type IssueList = ApiComponents['schemas']['IssueListJson'];
export type IssueAttachment = ApiComponents['schemas']['IssueAttachmentJson'];

class IssueService {
  async getIssues(
    projectId?: string,
    status?: Status,
    category?: string,
    assigneeId?: string,
    tenancyId?: string,
    limit = 100,
    offset = 0,
  ): Promise<IssueList> {
    const data = await apiClient.get('/ticketing/v1/issues', {
      params: {
        limit,
        offset,
        ...(projectId ? { projectId } : {}),
        ...(status ? { status } : {}),
        ...(category ? { category } : {}),
        ...(assigneeId ? { assigneeId } : {}),
        ...(tenancyId ? { tenancyId } : {}),
      },
    }) as IssueList;

    return {
      first: data.first ?? 0,
      size: data.size ?? 0,
      total: data.total ?? 0,
      issues: data.issues ?? [],
    };
  }

  async getIssue(issueId: string): Promise<Issue> {
    return apiClient.get('/ticketing/v1/issues/{issueId}', { pathParams: { issueId } }) as Promise<Issue>;
  }

  async createProjectIssue(body: Partial<Issue>): Promise<Issue> {
    return apiClient.post('/ticketing/v1/issues', body) as Promise<Issue>;
  }

  async createTenancyIssueWithAttachment(body: Partial<Issue>, files: File[]): Promise<Issue> {
    const formData = new FormData();

    // Create Blob with application/json content type for the issue part
    const issueBlob = new Blob([JSON.stringify(body)], { type: 'application/json' });
    formData.append('issue', issueBlob);

    files.forEach((file, index) => {
      formData.append(`attachment${index}`, file);
    });

    return apiClient.post('/ticketing/v1/issues', formData as any,
      {config: { headers: { 'Content-Type': 'multipart/form-data' } },}) as Promise<Issue>;
  }

  async updateIssue(issueId: string, body: Partial<Issue>): Promise<Issue> {
    return apiClient.patch('/ticketing/v1/issues/{issueId}', body, { pathParams: { issueId } }) as Promise<Issue>;
  }

  async deleteAttachment(issueId: string, attachmentId: string): Promise<void> {
    return apiClient.delete('/ticketing/v1/issues/{issueId}/attachments/{attachmentId}',
      {pathParams: { issueId, attachmentId },});
  }
}

export const issueService = new IssueService();
