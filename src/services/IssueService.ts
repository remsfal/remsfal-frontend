import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';

export type Status = ApiComponents['schemas']['IssueStatus'];
export type Type = ApiComponents['schemas']['IssueType'];
export type IssuePriority = ApiComponents['schemas']['IssuePriority'];
export type Issue = ApiComponents['schemas']['IssueJson'];
export type IssueItem = ApiComponents['schemas']['IssueItemJson'];
export type IssueList = ApiComponents['schemas']['IssueListJson'];

export class IssueService {
  /**
   * Get all issues for a project, optionally filtered by status, category, assigneeId, or tenancyId.
   */
  async getIssues(
    projectId: string,
    status?: Status,
    category?: string,
    assigneeId?: string,
    tenancyId?: string,
    limit = 100,
    offset = 0,
  ): Promise<IssueList> {
    const data = await apiClient.get('/ticketing/v1/issues', {
      params: {
        projectId,
        limit,
        offset,
        ...(status ? { status } : {}),
        ...(category ? { category } : {}),
        ...(assigneeId ? { assigneeId: assigneeId } : {}),
        ...(tenancyId ? { tenancyId: tenancyId } : {}),
      },
    }) as IssueList;

    return {
      first: data.first ?? 0,
      size: data.size ?? 0,
      total: data.total ?? 0,
      issues: data.issues ?? [],
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
