import { apiClient } from '@/services/ApiClient';
import type { IssueType, IssueStatus } from '@/services/IssueService';

export interface InboxMessage {
  id: string;
  receivedAt: Date;
  isRead: boolean;

  // Issue data
  issueId: string;
  issueTitle: string;
  issueType: IssueType;
  issueStatus: IssueStatus;

  // Project data
  projectId: string;
  projectName: string;
}

class InboxService {

  async fetchInboxData(): Promise<InboxMessage[]> {
    // @ts-expect-error: Endpoint not yet in generated schema
    return await apiClient.get('/notification/inbox') as InboxMessage[];
  }

  async markAsRead(messageId: string): Promise<void> {
    // @ts-expect-error: Endpoint not yet in generated schema
    await apiClient.patch('/notification/inbox/{messageId}/read', {}, {pathParams: { messageId }});
  }

  async deleteMessage(messageId: string): Promise<void> {
    // @ts-expect-error: Endpoint not yet in generated schema
    await apiClient.delete('/notification/inbox/{messageId}', {pathParams: { messageId }});
  }
}

export const inboxService: InboxService = new InboxService();
