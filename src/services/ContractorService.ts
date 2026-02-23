import { apiClient } from '@/services/ApiClient.ts';
import type { IssueJson, IssueListJson, IssueStatus } from '@/services/IssueService';

export class ContractorService {
  /**
   * Get all issues for contractors, optionally filtered by status or owner.
   */
  async getIssues(status?: IssueStatus, ownerId?: string, limit = 100, offset = 0): Promise<IssueListJson> {
    return apiClient.get('/ticketing/v1/issues', {
      params: {
        limit,
        offset,
        ...(status ? { status } : {}),
        ...(ownerId ? { owner: ownerId } : {}),
      },
    }) as Promise<IssueListJson>;
  }

  /**
   * Get a single issue by its ID.
   */
  async getIssue(issueId: string): Promise<IssueJson> {
    return apiClient.get('/ticketing/v1/issues/{issueId}', {pathParams: { issueId },}) as Promise<IssueJson>;
  }
}

export const contractorService = new ContractorService();
