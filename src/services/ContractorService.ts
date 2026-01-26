import { apiClient } from '@/services/ApiClient.ts';
import type { Issue, IssueList, Status } from '@/services/IssueService';

export class ContractorService {
  /**
   * Get all issues for contractors, optionally filtered by status or owner.
   */
  async getIssues(status?: Status, ownerId?: string, limit = 100, offset = 0): Promise<IssueList> {
    return apiClient.get('/ticketing/v1/issues', {
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
    return apiClient.get('/ticketing/v1/issues/{issueId}', {pathParams: { issueId },}) as Promise<Issue>;
  }
}

export const contractorService = new ContractorService();
