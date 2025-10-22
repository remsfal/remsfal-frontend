import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';

export type Status = ApiComponents['schemas']['Status'];
export type Issue = ApiComponents['schemas']['IssueJson'];
export type IssueList = ApiComponents['schemas']['IssueListJson'];
export type IssueItem = ApiComponents['schemas']['IssueItemJson'];

// API paths
const issuesPath = '/api/v1/contractors/issues';
const issuePath = '/api/v1/contractors/issues/{issueId}';

export class ContractorService {
  /**
   * Get all issues for contractors, optionally filtered by status or owner.
   */
  async getIssues(status?: Status, ownerId?: string): Promise<IssueList> {
    return apiClient
      .get(issuesPath, {
        params: {
          ...(status ? { status } : {}),
          ...(ownerId ? { owner: ownerId } : {}),
        },
      })
      .then(res => res.data);
  }

  /**
   * Get a single issue by its ID.
   */
  async getIssue(issueId: string): Promise<Issue> {
    return apiClient
      .get(issuePath, {
        pathParams: { issueId },
      })
      .then(res => res.data);
  }
}
export const contractorService = new ContractorService();
