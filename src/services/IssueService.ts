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
export type IssueRelationType = 'related-to' | 'blocks' | 'blocked-by' | 'duplicate-of' | 'children';
export type IssueRelationGroup = IssueRelationType | 'parent';

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

    formData.append('issue', new Blob([JSON.stringify(body)], { type: 'application/json' }));

    files.forEach((file) => {
      formData.append('attachment', file);
    });

    // Do NOT set Content-Type manually — axios/browser sets multipart/form-data with boundary automatically
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return apiClient.post('/ticketing/v1/issues', formData as any) as Promise<IssueJson>;
  }

  async updateIssue(issueId: string, body: Partial<IssueJson>): Promise<IssueJson> {
    return apiClient.patch('/ticketing/v1/issues/{issueId}', body, { pathParams: { issueId } }) as Promise<IssueJson>;
  }

  async deleteIssue(issueId: string): Promise<void> {
    return apiClient.delete('/ticketing/v1/issues/{issueId}', { pathParams: { issueId } });
  }

  async createIssueRelation(
    issueId: string,
    relationType: IssueRelationType,
    relatedIssueId: string,
  ): Promise<IssueJson> {
    // requestBody?: never for this endpoint — same cast precedent as createTenancyIssueWithAttachment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return apiClient.post('/ticketing/v1/issues/{issueId}/{relationType}/{relatedIssueId}', undefined as any, {
      pathParams: {
        issueId,
        relationType,
        relatedIssueId,
      },
    }) as Promise<IssueJson>;
  }

  async deleteIssueRelation(
    issueId: string,
    relationType: IssueRelationGroup,
    relatedIssueId: string,
  ): Promise<void> {
    return apiClient.delete('/ticketing/v1/issues/{issueId}/{relationType}/{relatedIssueId}', {
      pathParams: {
        issueId,
        relationType,
        relatedIssueId,
      },
    });
  }

  async setParentIssue(issueId: string, parentIssueId: string): Promise<IssueJson> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return apiClient.put('/ticketing/v1/issues/{issueId}/parent/{parentIssueId}', undefined as any, {
      pathParams: {
        issueId,
        parentIssueId,
      },
    }) as Promise<IssueJson>;
  }

  async deleteAttachment(issueId: string, attachmentId: string): Promise<void> {
    const path = '/ticketing/v1/issues/{issueId}/attachments/{attachmentId}';
    return apiClient.delete(path, { pathParams: { issueId, attachmentId } });
  }

  async uploadAttachments(issueId: string, files: File[]): Promise<void> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('attachment', file);
    });

    const response = await fetch(`/ticketing/v1/issues/${encodeURIComponent(issueId)}/attachments`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to upload attachments: ${response.status}`);
    }
  }
}

export const issueService = new IssueService();
