import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';

export type Status = ApiComponents['schemas']['Status'];
export type Issue = ApiComponents['schemas']['IssueJson'];
export type IssueList = ApiComponents['schemas']['IssueListJson'];
export type IssueItem = ApiComponents['schemas']['IssueItemJson'];

// API paths - using ticketing microservice
const issuesPath = '/ticketing/v1/issues';
const issuePath = '/ticketing/v1/issues/{issueId}';

export class ContractorService {
  /**
   * Get all issues for contractors, optionally filtered by status or owner.
   */
  async getIssues(status?: Status, ownerId?: string, limit = 100, offset = 0): Promise<IssueList> {
    return apiClient.get(issuesPath, {
      params: {
        limit,
        offset,
        ...(status ? { status } : {}),
        ...(ownerId ? { owner: ownerId } : {}),
      },
    }) as Promise<IssueList>;
  }

  /**
   * Get a single issue by its ID.
   */
  async getIssue(issueId: string): Promise<Issue> {
    return apiClient.get(issuePath, {pathParams: { issueId },}) as Promise<Issue>;
  }
}
export const contractorService = new ContractorService();
