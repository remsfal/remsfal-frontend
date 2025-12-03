import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';

export type Status = ApiComponents['schemas']['Status'];
export type Issue = ApiComponents['schemas']['IssueJson'];
export type IssueList = ApiComponents['schemas']['IssueListJson'];
export type IssueItem = ApiComponents['schemas']['IssueItemJson'];

// Status constants
export const StatusValues = {
  PENDING: 'PENDING',
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  CLOSED: 'CLOSED',
  REJECTED: 'REJECTED',
} as const;

// Issue type constants
export const ISSUE_TYPE_TASK = 'TASK';
export const ISSUE_STATUS_OPEN = 'OPEN';
export const ISSUE_STATUS_CLOSED = 'CLOSED';

export class IssueService {
  /**
   * Get all issues for a project, optionally filtered by status or owner.
   */
  async getIssues(
    projectId: string,
    status?: Status,
    ownerId?: string,
    limit = 100,
    offset = 0,
  ): Promise<IssueList> {
    const data = await apiClient.get('/ticketing/v1/issues', {
      params: {
        projectId,
        limit,
        offset,
        ...(status ? { status } : {}),
        ...(ownerId ? { owner: ownerId } : {}),
      },
    }) as IssueList;

    return {
      first: data.first ?? 0,
      size: data.size ?? 0,
      total: data.total ?? 0,
      issues: data.issues ?? [], // ✅ Always return an array
    };
  }

  /**
   * Get a single issue by its ID.
   */
  async getIssue(projectId: string, issueId: string): Promise<Issue> {
    return apiClient.get('/ticketing/v1/issues/{issueId}', {
      pathParams: { issueId },
      params: { projectId } as any,
    }) as Promise<Issue>;
  }

  /**
   * Create a new issue in a project.
   */
  async createIssue(projectId: string, body: Partial<Issue>): Promise<Issue> {
    return apiClient.post('/ticketing/v1/issues', body as any, {params: { projectId } as any,}) as Promise<Issue>;
  }

  /**
   * Modify an existing issue.
   */
  async modifyIssue(
    projectId: string,
    issueId: string,
    body: Partial<Issue>,
  ): Promise<Issue> {
    return apiClient.patch('/ticketing/v1/issues/{issueId}', body as any, {
      pathParams: { issueId },
      params: { projectId } as any,
    }) as Promise<Issue>;
  }
}

export const issueService = new IssueService();
