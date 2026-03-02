import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';
import { type UnitType } from '@/services/PropertyService.ts';

export type IssueCategory = ApiComponents['schemas']['IssueCategory'];
export type IssueStatus = ApiComponents['schemas']['IssueStatus'];
export type IssueType = ApiComponents['schemas']['IssueType'];
export type IssuePriority = ApiComponents['schemas']['IssuePriority'];
export type IssueJson = ApiComponents['schemas']['IssueJson'];
export type IssueItemJson = ApiComponents['schemas']['IssueItemJson'];
export type IssueListJson = ApiComponents['schemas']['IssueListJson'];
export type IssueAttachmentJson = ApiComponents['schemas']['IssueAttachmentJson'];

class IssueService {
  async getIssues(
    projectId?: string,
    preferTenancyIssues?: boolean,
    status?: IssueStatus,
    assigneeId?: string,
    agreementId?: string,
    rentalUnitId?: string,
    rentalUnitType?: UnitType,
    limit = 100,
    offset = 0,
  ): Promise<IssueListJson> {
    const result = await apiClient.get('/ticketing/v1/issues', {
      params: {
        limit,
        offset,
        ...(projectId ? { projectId } : {}),
        ...(preferTenancyIssues ? { preferTenancyIssues } : {}),
        ...(status ? { status } : {}),
        ...(assigneeId ? { assigneeId } : {}),
        ...(agreementId ? { agreementId } : {}),
        ...(rentalUnitId ? { rentalUnitId } : {}),
        ...(rentalUnitType ? { rentalUnitType } : {}),
      },
    }) as Partial<IssueListJson>;
    return {
      first: result.first ?? 0,
      size: result.size ?? 0,
      issues: result.issues ?? [],
    };
  }

  async getIssue(issueId: string): Promise<IssueJson> {
    return apiClient.get('/ticketing/v1/issues/{issueId}', { pathParams: { issueId } }) as Promise<IssueJson>;
  }

  async createProjectIssue(body: Partial<IssueJson>): Promise<IssueJson> {
    return apiClient.post('/ticketing/v1/issues', body) as Promise<IssueJson>;
  }

  async createTenancyIssueWithAttachment(body: Partial<IssueJson>, files: File[]): Promise<IssueJson> {
    const formData = new FormData();

    // Create Blob with application/json content type for the issue part
    const issueBlob = new Blob([JSON.stringify(body)], { type: 'application/json' });
    formData.append('issue', issueBlob);

    files.forEach((file, index) => {
      formData.append(`attachment${index}`, file);
    });

    return apiClient.post('/ticketing/v1/issues', formData as any,
      {config: { headers: { 'Content-Type': 'multipart/form-data' } },}) as Promise<IssueJson>;
  }

  async updateIssue(issueId: string, body: Partial<IssueJson>): Promise<IssueJson> {
    return apiClient.patch('/ticketing/v1/issues/{issueId}', body, { pathParams: { issueId } }) as Promise<IssueJson>;
  }

  async deleteAttachment(issueId: string, attachmentId: string): Promise<void> {
    return apiClient.delete('/ticketing/v1/issues/{issueId}/attachments/{attachmentId}',
      {pathParams: { issueId, attachmentId },});
  }
}

export const issueService = new IssueService();
