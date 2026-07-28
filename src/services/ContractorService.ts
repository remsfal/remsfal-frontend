import { apiClient } from '@/services/ApiClient';
import type { IssueJson, IssueListJson, IssueStatus } from '@/services/IssueService';

export class ContractorService {
  /**
   * Get all issues for contractors, optionally filtered by status or owner.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getIssues(status?: IssueStatus, ownerId?: string, limit = 100, cursor?: string): Promise<IssueListJson> {
    // TODO: no contractor-scoped issues endpoint exists yet; /ticketing/v1/issues now requires
    // a projectId this context doesn't have, so return an empty list until the backend adds one.
    return { size: 0, issues: [] };
  }

  /**
   * Get a single issue by its ID.
   */
  async getIssue(issueId: string): Promise<IssueJson> {
    return apiClient.get('/ticketing/v1/issues/{issueId}', {pathParams: { issueId },}) as Promise<IssueJson>;
  }
}

export const contractorService = new ContractorService();
