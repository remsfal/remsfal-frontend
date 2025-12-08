import { apiClient } from '@/services/ApiClient';

export type IssueType = 'APPLICATION' | 'TASK' | 'DEFECT' | 'MAINTENANCE';
export type IssueStatus = 'PENDING' | 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'REJECTED';

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
  private createMockMessage(
    id: string,
    receivedAt: Date,
    isRead: boolean,
    issueId: string,
    issueTitle: string,
    issueType: IssueType,
    issueStatus: IssueStatus,
    projectId: string,
    projectName: string
  ): InboxMessage {
    return {
      id,
      receivedAt,
      isRead,
      issueId,
      issueTitle,
      issueType,
      issueStatus,
      projectId,
      projectName,
    };
  }

  generateMockInboxData(): InboxMessage[] {
    return [
      this.createMockMessage(
        '1',
        new Date('2025-06-01T10:15:00'),
        false,
        'issue-101',
        'Heizung defekt',
        'DEFECT',
        'OPEN',
        'proj-1',
        'Neubau Musterstraße'
      ),
      this.createMockMessage(
        '2',
        new Date('2025-05-28T14:30:00'),
        false,
        'issue-102',
        'Wartung Aufzug',
        'MAINTENANCE',
        'IN_PROGRESS',
        'proj-1',
        'Neubau Musterstraße'
      ),
      this.createMockMessage(
        '3',
        new Date('2025-05-25T08:00:00'),
        true,
        'issue-201',
        'Fenster undicht',
        'DEFECT',
        'PENDING',
        'proj-2',
        'Campus Treskowallee'
      ),
      this.createMockMessage(
        '4',
        new Date('2025-05-20T09:45:00'),
        false,
        'issue-202',
        'Antrag Mieterwechsel',
        'APPLICATION',
        'OPEN',
        'proj-2',
        'Campus Treskowallee'
      ),
      this.createMockMessage(
        '5',
        new Date('2025-05-18T11:20:00'),
        false,
        'issue-103',
        'Reinigung Treppenhaus',
        'TASK',
        'CLOSED',
        'proj-1',
        'Neubau Musterstraße'
      ),
      this.createMockMessage(
        '6',
        new Date('2025-05-15T22:31:00'),
        true,
        'issue-203',
        'Rauchmelder Alarm',
        'DEFECT',
        'CLOSED',
        'proj-2',
        'Campus Treskowallee'
      ),
      this.createMockMessage(
        '7',
        new Date('2025-05-12T16:00:00'),
        false,
        'issue-104',
        'Schlüsselübergabe',
        'TASK',
        'REJECTED',
        'proj-1',
        'Neubau Musterstraße'
      ),
    ];
  }

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
