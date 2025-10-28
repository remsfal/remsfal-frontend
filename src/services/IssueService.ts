import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';

export type Status = ApiComponents['schemas']['Status'];
export type Issue = ApiComponents['schemas']['IssueJson'];
export type IssueList = ApiComponents['schemas']['IssueListJson'];
export type IssueItem = ApiComponents['schemas']['IssueItemJson'];

// API paths
const issuesPath = '/ticketing/v1/issues';
const issuePath = '/ticketing/v1/issues/{issueId}';

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
  ): Promise<IssueList> {
    const res = await apiClient.get(issuesPath, {
      params: {
        projectId,
        ...(status ? { status } : {}),
        ...(ownerId ? { owner: ownerId } : {}),
      },
    });
  
    const data = res.data ?? {};
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
    return apiClient
      .get(issuePath, {
        pathParams: { issueId },
        params: { projectId },
      })
      .then(res => res.data);
  }

  /**
   * Create a new issue in a project.
   */
  async createIssue(projectId: string, body: Partial<Issue>): Promise<Issue> {
    return apiClient
      .post(issuesPath, body, {params: { projectId },})
      .then(res => res.data);
  }

  /**
   * Modify an existing issue.
   */
  async modifyIssue(
    projectId: string,
    issueId: string,
    body: Partial<Issue>,
  ): Promise<Issue> {
    return apiClient
      .patch(issuePath, body, {
        pathParams: { issueId },
        params: { projectId },
      })
      .then(res => res.data);
  }
}

export const issueService = new IssueService();
